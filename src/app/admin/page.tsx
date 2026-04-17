'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SurveyResponse {
  id: string
  created_at: string
  q1_feeling: string | null
  q2_favorite_place: string | null
  q3_why_place: string[] | null
  q3_why_place_other: string | null
  q4_contact_group: string | null
  q5_change_contact_why: string | null
  q6_new_place_choices: string[] | null
  q7_place_should_be: string[] | null
  q7_place_should_be_other: string | null
  q8_absolutely_not: string | null
  q9_contribute: string | null
  q10_contribute_what: string | null
  q11_daily_life_better: string | null
  age_group: string | null
  lives_in_rubroek: string | null
  keep_updated: string | null
  email: string | null
}

interface ChartData {
  label: string
  value: number
  percentage: number
}

function SimpleChart({ data, title }: { data: ChartData[]; title: string }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-[#1a1a2e] mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[#555]">{item.label}</span>
              <span className="text-xs font-medium text-[#999]">{item.value}</span>
            </div>
            <div className="w-full bg-[#E8E8E8] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#E31E24] rounded-full transition-all duration-300"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [responses, setResponses] = useState<SurveyResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [ageGroup, setAgeGroup] = useState('all')
  const [livesInRubroek, setLivesInRubroek] = useState('all')
  const [search, setSearch] = useState('')

  const fetchResponses = useCallback(async () => {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    if (ageGroup !== 'all') params.append('ageGroup', ageGroup)
    if (livesInRubroek !== 'all') params.append('livesInRubroek', livesInRubroek)
    if (search) params.append('search', search)

    const res = await fetch(`/api/admin/responses?${params}`)
    if (res.status === 401) {
      router.push('/admin/login')
      return
    }
    const result = await res.json()
    setResponses(result.data || [])
    setLoading(false)
  }, [dateFrom, dateTo, ageGroup, livesInRubroek, search, router])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchResponses()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [fetchResponses])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/admin/responses', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setResponses(responses.filter(r => r.id !== id))
      setDeleteConfirmId(null)
    }
  }

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)
    if (ageGroup !== 'all') params.append('ageGroup', ageGroup)

    const res = await fetch(`/api/admin/export?${params}`)
    if (res.ok) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rubroek-survey-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  // Calculate stats
  const totalResponses = responses.length
  const todayResponses = responses.filter(r => {
    const date = new Date(r.created_at)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length
  const contributeYes = responses.filter(r => r.q9_contribute === 'Ja').length
  const contributePercentage = totalResponses > 0 ? Math.round((contributeYes / totalResponses) * 100) : 0

  // Chart data
  const q6Choices = (responses.flatMap(r => r.q6_new_place_choices || []) as string[])
  const q6Data: ChartData[] = Object.entries(
    q6Choices.reduce((acc, choice) => {
      acc[choice] = (acc[choice] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([label, value]) => ({
    label,
    value,
    percentage: totalResponses > 0 ? (value / totalResponses) * 100 : 0,
  })).sort((a, b) => b.value - a.value).slice(0, 5)

  const q4Groups = responses.filter(r => r.q4_contact_group).map(r => r.q4_contact_group)
  const q4Data: ChartData[] = Object.entries(
    q4Groups.reduce((acc, group) => {
      if (!group) return acc
      acc[group] = (acc[group] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  ).map(([label, value]) => ({
    label,
    value,
    percentage: totalResponses > 0 ? (value / totalResponses) * 100 : 0,
  })).sort((a, b) => b.value - a.value).slice(0, 5)

  const q9Data: ChartData[] = [
    {
      label: 'Ja',
      value: responses.filter(r => r.q9_contribute === 'Ja').length,
      percentage: contributePercentage,
    },
    {
      label: 'Nee',
      value: responses.filter(r => r.q9_contribute === 'Nee').length,
      percentage: totalResponses > 0 ? (responses.filter(r => r.q9_contribute === 'Nee').length / totalResponses) * 100 : 0,
    },
    {
      label: 'Misschien',
      value: responses.filter(r => r.q9_contribute === 'Misschien').length,
      percentage: totalResponses > 0 ? (responses.filter(r => r.q9_contribute === 'Misschien').length / totalResponses) * 100 : 0,
    },
  ].filter(d => d.value > 0)

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <div className="bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E31E24] flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <h1 className="text-xl font-bold text-[#1a1a2e]">Pulse Rubroek Admin</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[#E31E24] hover:text-[#C41D22] transition-colors"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-6">
            <p className="text-sm font-medium text-[#999] mb-2">Totale Inzendingen</p>
            <p className="text-3xl font-bold text-[#1a1a2e]">{totalResponses}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm font-medium text-[#999] mb-2">Vandaag</p>
            <p className="text-3xl font-bold text-[#1a1a2e]">{todayResponses}</p>
          </div>
          <div className="card p-6">
            <p className="text-sm font-medium text-[#999] mb-2">Wil Bijdragen</p>
            <p className="text-3xl font-bold text-[#E31E24]">{contributePercentage}%</p>
            <p className="text-xs text-[#999] mt-1">{contributeYes} van {totalResponses}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-[#1a1a2e] mb-4">Filters</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Van</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="survey-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Tot</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="survey-input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Leeftijd</label>
              <select value={ageGroup} onChange={(e) => setAgeGroup(e.target.value)} className="survey-input">
                <option value="all">Alle</option>
                <option value="16-24">16-24</option>
                <option value="25-40">25-40</option>
                <option value="41-60">41-60</option>
                <option value="60+">60+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Woont in Rubroek</label>
              <select value={livesInRubroek} onChange={(e) => setLivesInRubroek(e.target.value)} className="survey-input">
                <option value="all">Alle</option>
                <option value="Ja">Ja</option>
                <option value="Nee">Nee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a2e] mb-2">Zoeken</label>
              <input
                type="text"
                placeholder="Zoekterm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="survey-input"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setAgeGroup('all')
                setLivesInRubroek('all')
                setSearch('')
              }}
              className="text-sm font-medium text-[#999] hover:text-[#555] transition-colors"
            >
              Reset Filters
            </button>
            <button onClick={handleExport} className="btn-primary text-sm py-2 px-4">
              Exporteer als CSV
            </button>
          </div>
        </div>

        {/* Charts */}
        {q6Data.length > 0 || q4Data.length > 0 || q9Data.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {q6Data.length > 0 && <SimpleChart data={q6Data} title="Nieuwe Plekken (Q6)" />}
            {q4Data.length > 0 && <SimpleChart data={q4Data} title="Contactgroep (Q4)" />}
            {q9Data.length > 0 && <SimpleChart data={q9Data} title="Bereid tot Bijdrage (Q9)" />}
          </div>
        ) : null}

        {/* Responses Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F5F5] border-b border-[#E0E0E0]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Gevoel</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Leeftijd</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Rubroek</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#999] uppercase">Bijdrage</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#999] uppercase">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#999]">
                      Laden...
                    </td>
                  </tr>
                ) : responses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-[#999]">
                      Geen reacties gevonden
                    </td>
                  </tr>
                ) : (
                  responses.map(response => (
                    <tbody key={response.id}>
                      <tr className="hover:bg-[#F9F9F9] transition-colors">
                        <td className="px-6 py-4 text-sm text-[#555]">
                          {new Date(response.created_at).toLocaleDateString('nl-NL')}
                        </td>
                        <td className="px-6 py-4 text-sm text-[#555]">{response.q1_feeling || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#555]">{response.age_group || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#555]">{response.lives_in_rubroek || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#555]">{response.q4_contact_group || '-'}</td>
                        <td className="px-6 py-4 text-sm text-[#555]">{response.q9_contribute || '-'}</td>
                        <td className="px-6 py-4 text-right text-sm">
                          <button
                            onClick={() => setExpandedId(expandedId === response.id ? null : response.id)}
                            className="text-[#E31E24] hover:text-[#C41D22] font-medium transition-colors"
                          >
                            {expandedId === response.id ? 'Verbergen' : 'Bekijk'}
                          </button>
                        </td>
                      </tr>
                      {expandedId === response.id && (
                        <tr className="bg-[#F9F9F9]">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-[#1a1a2e] mb-4">Details</h4>
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <p className="text-[#999] font-medium">Ingediend op</p>
                                    <p className="text-[#555]">{new Date(response.created_at).toLocaleString('nl-NL')}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#999] font-medium">Favoriete plek</p>
                                    <p className="text-[#555]">{response.q2_favorite_place || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#999] font-medium">Waarom die plek</p>
                                    <p className="text-[#555]">{Array.isArray(response.q3_why_place) ? response.q3_why_place.join(', ') : response.q3_why_place || '-'}</p>
                                  </div>
                                  {response.q3_why_place_other && (
                                    <div>
                                      <p className="text-[#999] font-medium">Anders (waarom plek)</p>
                                      <p className="text-[#555]">{response.q3_why_place_other}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#1a1a2e] mb-4">Antwoorden</h4>
                                <div className="space-y-3 text-sm">
                                  <div>
                                    <p className="text-[#999] font-medium">Wat moet de plek zijn</p>
                                    <p className="text-[#555]">{Array.isArray(response.q7_place_should_be) ? response.q7_place_should_be.join(', ') : response.q7_place_should_be || '-'}</p>
                                  </div>
                                  {response.q7_place_should_be_other && (
                                    <div>
                                      <p className="text-[#999] font-medium">Anders (plek moet zijn)</p>
                                      <p className="text-[#555]">{response.q7_place_should_be_other}</p>
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-[#999] font-medium">Absoluut niet</p>
                                    <p className="text-[#555]">{response.q8_absolutely_not || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#999] font-medium">Bijdrage wat</p>
                                    <p className="text-[#555]">{response.q10_contribute_what || '-'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[#999] font-medium">Dagelijks leven</p>
                                    <p className="text-[#555]">{response.q11_daily_life_better || '-'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {response.keep_updated === 'Ja' && response.email && (
                              <div className="mt-4 pt-4 border-t border-[#E0E0E0]">
                                <p className="text-[#999] font-medium text-sm">Email voor updates</p>
                                <p className="text-[#555] text-sm">{response.email}</p>
                              </div>
                            )}
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(response.id)}
                                className="btn-secondary text-sm py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100"
                              >
                                Verwijderen
                              </button>
                              {deleteConfirmId === response.id && (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDelete(response.id)}
                                    className="btn-secondary text-sm py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200"
                                  >
                                    Bevestigen
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="btn-secondary text-sm py-2 px-4 bg-[#F0F0F0] text-[#555] hover:bg-[#E5E5E5]"
                                  >
                                    Annuleren
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {responses.length > 0 && (
            <div className="px-6 py-4 bg-[#F9F9F9] border-t border-[#E0E0E0] text-sm text-[#999]">
              {responses.length} reactie{responses.length !== 1 ? 's' : ''} weergegeven
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
