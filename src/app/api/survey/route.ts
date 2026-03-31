import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || '')).digest('hex').slice(0, 16)
}

function sanitize(str: string | undefined | null, maxLen = 2000): string {
  if (!str) return ''
  return str.trim().slice(0, maxLen)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Honeypot check
    if (body.honeypot) {
      return NextResponse.json({ success: true }) // Silent rejection
    }

    // Turnstile verification
    const turnstileToken = body.turnstileToken
    if (turnstileToken && process.env.TURNSTILE_SECRET_KEY) {
      const formData = new URLSearchParams()
      formData.append('secret', process.env.TURNSTILE_SECRET_KEY)
      formData.append('response', turnstileToken)

      const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      })
      const turnstileData = await turnstileRes.json()
      if (!turnstileData.success) {
        return NextResponse.json({ error: 'Spam verificatie mislukt' }, { status: 400 })
      }
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const ipHash = hashIP(ip)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check rate limit
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { count } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', fiveMinAgo)

    if (count && count >= 3) {
      return NextResponse.json(
        { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
        { status: 429 }
      )
    }

    // Basic validation
    if (!body.q1_feeling) {
      return NextResponse.json({ error: 'Vul alsjeblieft de eerste vraag in.' }, { status: 400 })
    }

    // Sanitize and prepare data
    const surveyData = {
      q1_feeling: sanitize(body.q1_feeling, 100),
      q2_favorite_place: sanitize(body.q2_favorite_place),
      q3_why_place: Array.isArray(body.q3_why_place) ? body.q3_why_place.slice(0, 10) : [],
      q3_why_place_other: sanitize(body.q3_why_place_other, 500),
      q4_contact_group: sanitize(body.q4_contact_group, 100),
      q5_change_contact_why: sanitize(body.q5_change_contact_why),
      q6_new_place_choices: Array.isArray(body.q6_new_place_choices) ? body.q6_new_place_choices.slice(0, 2) : [],
      q7_place_should_be: Array.isArray(body.q7_place_should_be) ? body.q7_place_should_be.slice(0, 4) : [],
      q7_place_should_be_other: sanitize(body.q7_place_should_be_other, 500),
      q8_absolutely_not: sanitize(body.q8_absolutely_not),
      q9_contribute: sanitize(body.q9_contribute, 100),
      q10_contribute_what: sanitize(body.q10_contribute_what),
      q11_daily_life_better: sanitize(body.q11_daily_life_better),
      age_group: sanitize(body.age_group, 50),
      lives_in_rubroek: sanitize(body.lives_in_rubroek, 10),
      keep_updated: sanitize(body.keep_updated, 10),
      email: body.keep_updated === 'Ja' ? sanitize(body.email, 254) : null,
      ip_hash: ipHash,
      user_agent: sanitize(request.headers.get('user-agent') || '', 500),
    }

    // Insert
    const { error } = await supabase.from('survey_responses').insert(surveyData)
    if (error) {
      console.error('Survey insert error:', error)
      return NextResponse.json({ error: 'Er ging iets mis. Probeer het opnieuw.' }, { status: 500 })
    }

    // Record rate limit
    await supabase.from('rate_limits').insert({ ip_hash: ipHash })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Survey API error:', err)
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}
