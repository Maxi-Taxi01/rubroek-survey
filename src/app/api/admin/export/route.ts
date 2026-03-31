import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Papa from 'papaparse'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { searchParams } = new URL(request.url)
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const ageGroup = searchParams.get('ageGroup')

  let query = supabase.from('survey_responses').select('*').order('created_at', { ascending: false })
  if (dateFrom) query = query.gte('created_at', dateFrom)
  if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59')
  if (ageGroup && ageGroup !== 'all') query = query.eq('age_group', ageGroup)

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  // Flatten arrays for CSV
  const csvData = (data || []).map(r => ({
    id: r.id,
    datum: new Date(r.created_at).toLocaleDateString('nl-NL'),
    gevoel: r.q1_feeling,
    favoriete_plek: r.q2_favorite_place,
    waarom_plek: Array.isArray(r.q3_why_place) ? r.q3_why_place.join(', ') : r.q3_why_place,
    waarom_plek_anders: r.q3_why_place_other,
    contact_groep: r.q4_contact_group,
    contact_veranderen: r.q5_change_contact_why,
    nieuwe_plek_keuzes: Array.isArray(r.q6_new_place_choices) ? r.q6_new_place_choices.join(', ') : r.q6_new_place_choices,
    plek_moet_zijn: Array.isArray(r.q7_place_should_be) ? r.q7_place_should_be.join(', ') : r.q7_place_should_be,
    plek_moet_zijn_anders: r.q7_place_should_be_other,
    absoluut_niet: r.q8_absolutely_not,
    bijdragen: r.q9_contribute,
    bijdragen_wat: r.q10_contribute_what,
    dagelijks_leven: r.q11_daily_life_better,
    leeftijdsgroep: r.age_group,
    woont_in_rubroek: r.lives_in_rubroek,
    op_de_hoogte: r.keep_updated,
    email: r.email,
  }))

  const csv = Papa.unparse(csvData)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rubroek-survey-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
