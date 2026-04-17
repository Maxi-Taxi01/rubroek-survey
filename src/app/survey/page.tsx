'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FormData {
  q1_feeling: string
  q2_favorite_place: string
  q3_why_place: string[]
  q3_why_place_other: string
  q4_contact_group: string
  q5_change_contact_why: string
  q6_new_place_choices: string[]
  q7_place_should_be: string[]
  q7_place_should_be_other: string
  q8_absolutely_not: string
  q9_contribute: string
  q10_contribute_what: string
  q11_daily_life_better: string
  age_group: string
  lives_in_rubroek: string
  keep_updated: string
  email: string
  turnstileToken: string
  honeypot: string
}

const initialFormData: FormData = {
  q1_feeling: '',
  q2_favorite_place: '',
  q3_why_place: [],
  q3_why_place_other: '',
  q4_contact_group: '',
  q5_change_contact_why: '',
  q6_new_place_choices: [],
  q7_place_should_be: [],
  q7_place_should_be_other: '',
  q8_absolutely_not: '',
  q9_contribute: '',
  q10_contribute_what: '',
  q11_daily_life_better: '',
  age_group: '',
  lives_in_rubroek: '',
  keep_updated: '',
  email: '',
  turnstileToken: '',
  honeypot: '',
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

export default function SurveyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [turnstileLoaded, setTurnstileLoaded] = useState(
    () => isDemoMode || (typeof window !== 'undefined' && !!window.turnstile)
  )

  const totalSteps = 8

  // Load Turnstile script (skip in demo mode)
  useEffect(() => {
    if (isDemoMode) return
    if (!window.turnstile) {
      const script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = () => {
        setTurnstileLoaded(true)
      }
      document.head.appendChild(script)
    }
  }, [])

  // Reset Turnstile when moving to final step
  useEffect(() => {
    if (currentStep === 7 && turnstileLoaded && window.turnstile) {
      setTimeout(() => {
        window.turnstile?.reset?.()
      }, 100)
    }
  }, [currentStep, turnstileLoaded])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleMultiSelect = (field: keyof FormData, option: string) => {
    setFormData(prev => {
      const current = prev[field] as string[]
      const isSelected = current.includes(option)
      return {
        ...prev,
        [field]: isSelected
          ? current.filter(item => item !== option)
          : [...current, option],
      }
    })
  }

  const handleSingleSelect = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 0:
        return formData.q1_feeling !== ''
      case 1:
        return (
          formData.q2_favorite_place.trim() !== '' &&
          formData.q3_why_place.length > 0
        )
      case 2:
        return (
          formData.q4_contact_group !== '' &&
          formData.q5_change_contact_why.trim() !== ''
        )
      case 3:
        return formData.q6_new_place_choices.length > 0 && formData.q6_new_place_choices.length <= 2
      case 4:
        return (
          formData.q7_place_should_be.length >= 2 &&
          formData.q7_place_should_be.length <= 3 &&
          formData.q8_absolutely_not.trim() !== ''
        )
      case 5:
        return formData.q9_contribute !== ''
      case 6:
        return formData.q11_daily_life_better.trim() !== ''
      case 7:
        return (
          formData.age_group !== '' &&
          formData.lives_in_rubroek !== '' &&
          formData.keep_updated !== '' &&
          (formData.keep_updated === 'Nee' || formData.email.trim() !== '')
        )
      default:
        return true
    }
  }

  const handleNextStep = () => {
    if (canProceedToNext()) {
      setSubmitError('')
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
    } else {
      setSubmitError('Vul alsjeblieft alle verplichte velden in')
    }
  }

  const handlePrevStep = () => {
    setSubmitError('')
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!canProceedToNext()) {
      setSubmitError('Vul alsjeblieft alle verplichte velden in')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    // In demo mode, skip the API call and redirect directly to the thank-you page
    if (isDemoMode) {
      router.push('/bedankt')
      return
    }

    try {
      // Get Turnstile token
      let token = ''
      if (window.turnstile) {
        token = window.turnstile?.getResponse?.() || ''
      }

      const submitData = {
        ...formData,
        turnstileToken: token,
      }

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const error = await response.json()
        setSubmitError(error.error || error.message || 'Verzending mislukt. Probeer het opnieuw.')
        setIsSubmitting(false)
        return
      }

      // Success - redirect to thank you page
      router.push('/bedankt')
    } catch {
      setSubmitError('Er is een fout opgetreden. Probeer het opnieuw.')
      setIsSubmitting(false)
    }
  }

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Demo mode banner */}
      {isDemoMode && (
        <div
          className="text-center py-2 px-4 text-sm font-medium"
          style={{ backgroundColor: '#FFF3CD', color: '#856404', borderBottom: '1px solid #FFEEBA' }}
        >
          🔍 Preview-modus — antwoorden worden niet opgeslagen
        </div>
      )}

      {/* Header with back link */}
      <div className="p-4 border-b" style={{ borderColor: '#e0e0e0' }}>
        <Link
          href="/"
          className="text-sm font-medium hover:opacity-80 transition-opacity"
          style={{ color: '#2B3990' }}
        >
          ← Terug naar start
        </Link>
      </div>

      {/* Main content */}
      <div className="py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-lg font-semibold" style={{ color: '#1a1a2e' }}>
                Rubroek Survey
              </h1>
              <span className="text-sm" style={{ color: '#555' }}>
                Stap {currentStep + 1} van {totalSteps}
              </span>
            </div>
            <div
              className="progress-bar"
              style={{
                backgroundColor: '#e0e0e0',
                height: '6px',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                className="progress-bar-fill"
                style={{
                  width: `${progressPercentage}%`,
                  backgroundColor: '#E31E24',
                  height: '100%',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <div
              className="mb-6 p-4 rounded text-sm fade-in"
              style={{
                backgroundColor: '#FAE8E8',
                color: '#E31E24',
                borderLeft: '4px solid #E31E24',
              }}
            >
              {submitError}
            </div>
          )}

          {/* Step 0: Quick start */}
          {currentStep === 0 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#E31E24' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 1 — Snel begin
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-4" style={{ color: '#1a1a2e' }}>
                  Wat past het beste bij jou vandaag?
                </label>
                <div className="space-y-3">
                  {['😊 Ik voel me verbonden met de wijk', '😐 Gaat wel', '😔 Ik mis contact'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('q1_feeling', option)}
                      className={`survey-option w-full p-4 text-left rounded transition-all ${
                        formData.q1_feeling === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.q1_feeling === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.q1_feeling === option ? '#E31E24' : '#e0e0e0',
                        border: formData.q1_feeling === option ? '2px solid #E31E24' : '1px solid #e0e0e0',
                        color: '#1a1a2e',
                        boxShadow: formData.q1_feeling === option ? '0 0 0 2px rgba(227,30,36,0.2)' : 'none',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Your Rubroek */}
          {currentStep === 1 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#2B3990' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 2 — Jouw Rubroek
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                  Waar kom je graag in de wijk?
                </label>
                <input
                  type="text"
                  value={formData.q2_favorite_place}
                  onChange={e => handleInputChange('q2_favorite_place', e.target.value)}
                  className="survey-input w-full"
                  placeholder="Typ je antwoord..."
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#1a1a2e',
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Waarom juist daar?
                </label>
                <div className="space-y-2">
                  {['Gezellig', 'Rustig', 'Mensen', 'Activiteiten', 'Anders'].map(option => (
                    <div key={option}>
                      <button
                        onClick={() => handleMultiSelect('q3_why_place', option)}
                        className={`survey-option w-full p-3 text-left rounded transition-all text-sm ${
                          formData.q3_why_place.includes(option)
                            ? 'ring-2'
                            : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: formData.q3_why_place.includes(option) ? '#FAE8E8' : '#fff',
                          borderColor: formData.q3_why_place.includes(option) ? '#E31E24' : '#e0e0e0',
                          border: '1px solid',
                          color: '#1a1a2e',
                        }}
                      >
                        {option}
                      </button>
                      {option === 'Anders' && formData.q3_why_place.includes('Anders') && (
                        <input
                          type="text"
                          value={formData.q3_why_place_other}
                          onChange={e => handleInputChange('q3_why_place_other', e.target.value)}
                          className="survey-input w-full mt-2"
                          placeholder="Wat anders?"
                          style={{
                            backgroundColor: '#fff',
                            borderColor: '#e0e0e0',
                            color: '#1a1a2e',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 2 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#8DC63F' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 3 — Contact
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Met wie heb je het meeste contact?
                </label>
                <div className="space-y-2">
                  {['Jongeren', 'Ouderen', 'Beide', 'Bijna niemand'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('q4_contact_group', option)}
                      className={`survey-option w-full p-3 text-left rounded transition-all ${
                        formData.q4_contact_group === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.q4_contact_group === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.q4_contact_group === option ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                  Zou je dat anders willen? Waarom?
                </label>
                <textarea
                  value={formData.q5_change_contact_why}
                  onChange={e => handleInputChange('q5_change_contact_why', e.target.value)}
                  className="survey-input w-full"
                  placeholder="Typ je antwoord..."
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#1a1a2e',
                    minHeight: '100px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 3: New place */}
          {currentStep === 3 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#E31E24' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 4 — Nieuwe plek
                </h2>
              </div>

              <div className="mb-2 p-2 rounded text-sm" style={{ backgroundColor: '#FAE8E8', color: '#E31E24' }}>
                Kies maximaal 2
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Er komt een nieuwe plek in Rubroek. Wat kies jij?
                </label>
                <div className="space-y-2">
                  {[
                    'Creatief (maken, kunst)',
                    'Ontmoeten (koffie, praten)',
                    'Fun (spel, muziek)',
                    'Rust (lezen, chillen)',
                    'Samen eten',
                    'Gesprekken / verhalen',
                  ].map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        if (formData.q6_new_place_choices.includes(option)) {
                          handleMultiSelect('q6_new_place_choices', option)
                        } else if (formData.q6_new_place_choices.length < 2) {
                          handleMultiSelect('q6_new_place_choices', option)
                        }
                      }}
                      className={`survey-option w-full p-3 text-left rounded transition-all text-sm ${
                        formData.q6_new_place_choices.includes(option)
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.q6_new_place_choices.includes(option) ? '#FAE8E8' : '#fff',
                        borderColor: formData.q6_new_place_choices.includes(option) ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                        opacity: !formData.q6_new_place_choices.includes(option) && formData.q6_new_place_choices.length >= 2 ? 0.5 : 1,
                        cursor: !formData.q6_new_place_choices.includes(option) && formData.q6_new_place_choices.length >= 2 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: What matters */}
          {currentStep === 4 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#2B3990' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 5 — Wat telt
                </h2>
              </div>

              <div className="mb-6">
                <div className="mb-2 p-2 rounded text-sm" style={{ backgroundColor: '#FAE8E8', color: '#E31E24' }}>
                  Kies 2 of 3
                </div>

                <label className="block font-medium mb-3 mt-4" style={{ color: '#1a1a2e' }}>
                  Deze plek moet vooral zijn:
                </label>
                <div className="space-y-2">
                  {['Veilig', 'Gezellig', 'Open voor iedereen', 'Niet verplicht', 'Dichtbij', 'Anders'].map(option => (
                    <div key={option}>
                      <button
                        onClick={() => {
                          if (formData.q7_place_should_be.includes(option)) {
                            handleMultiSelect('q7_place_should_be', option)
                          } else if (formData.q7_place_should_be.length < 3) {
                            handleMultiSelect('q7_place_should_be', option)
                          }
                        }}
                        className={`survey-option w-full p-3 text-left rounded transition-all text-sm ${
                          formData.q7_place_should_be.includes(option)
                            ? 'ring-2'
                            : 'hover:opacity-90'
                        }`}
                        style={{
                          backgroundColor: formData.q7_place_should_be.includes(option) ? '#FAE8E8' : '#fff',
                          borderColor: formData.q7_place_should_be.includes(option) ? '#E31E24' : '#e0e0e0',
                          border: '1px solid',
                          color: '#1a1a2e',
                          opacity: !formData.q7_place_should_be.includes(option) && formData.q7_place_should_be.length >= 3 ? 0.5 : 1,
                          cursor: !formData.q7_place_should_be.includes(option) && formData.q7_place_should_be.length >= 3 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {option}
                      </button>
                      {option === 'Anders' && formData.q7_place_should_be.includes('Anders') && (
                        <input
                          type="text"
                          value={formData.q7_place_should_be_other}
                          onChange={e => handleInputChange('q7_place_should_be_other', e.target.value)}
                          className="survey-input w-full mt-2"
                          placeholder="Wat anders?"
                          style={{
                            backgroundColor: '#fff',
                            borderColor: '#e0e0e0',
                            color: '#1a1a2e',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                  En absoluut niet:
                </label>
                <textarea
                  value={formData.q8_absolutely_not}
                  onChange={e => handleInputChange('q8_absolutely_not', e.target.value)}
                  className="survey-input w-full"
                  placeholder="Typ je antwoord..."
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#1a1a2e',
                    minHeight: '100px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 5: Participation */}
          {currentStep === 5 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#8DC63F' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 6 — Meedoen
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Zou je hier zelf iets willen doen of bijdragen?
                </label>
                <div className="space-y-2">
                  {['Ja', 'Misschien', 'Nee'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('q9_contribute', option)}
                      className={`survey-option w-full p-3 text-left rounded transition-all ${
                        formData.q9_contribute === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.q9_contribute === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.q9_contribute === option ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {(formData.q9_contribute === 'Ja' || formData.q9_contribute === 'Misschien') && (
                <div className="mb-6 fade-in">
                  <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                    Wat zou je leuk vinden om te doen?
                  </label>
                  <textarea
                    value={formData.q10_contribute_what}
                    onChange={e => handleInputChange('q10_contribute_what', e.target.value)}
                    className="survey-input w-full"
                    placeholder="Typ je antwoord..."
                    style={{
                      backgroundColor: '#fff',
                      borderColor: '#e0e0e0',
                      color: '#1a1a2e',
                      minHeight: '100px',
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Final */}
          {currentStep === 6 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#E31E24' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Deel 7 — Afsluiting
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                  Wat zou deze plek voor jou beter maken in je dagelijks leven?
                </label>
                <textarea
                  value={formData.q11_daily_life_better}
                  onChange={e => handleInputChange('q11_daily_life_better', e.target.value)}
                  className="survey-input w-full"
                  placeholder="Typ je antwoord..."
                  style={{
                    backgroundColor: '#fff',
                    borderColor: '#e0e0e0',
                    color: '#1a1a2e',
                    minHeight: '120px',
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 7: Profile + Submit */}
          {currentStep === 7 && (
            <div className="card fade-in slide-up">
              <div className="flex items-center gap-2 mb-6">
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#2B3990' }}
                />
                <h2 className="text-xl font-semibold" style={{ color: '#1a1a2e' }}>
                  Profiel & Versturen
                </h2>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Leeftijdsgroep
                </label>
                <div className="space-y-2">
                  {['Jongere', 'Volwassene', 'Oudere'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('age_group', option)}
                      className={`survey-option w-full p-3 text-left rounded transition-all ${
                        formData.age_group === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.age_group === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.age_group === option ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Woon je in Rubroek?
                </label>
                <div className="space-y-2">
                  {['Ja', 'Nee'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('lives_in_rubroek', option)}
                      className={`survey-option w-full p-3 text-left rounded transition-all ${
                        formData.lives_in_rubroek === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.lives_in_rubroek === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.lives_in_rubroek === option ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-3" style={{ color: '#1a1a2e' }}>
                  Wil je op de hoogte blijven?
                </label>
                <div className="space-y-2">
                  {['Ja', 'Nee'].map(option => (
                    <button
                      key={option}
                      onClick={() => handleSingleSelect('keep_updated', option)}
                      className={`survey-option w-full p-3 text-left rounded transition-all ${
                        formData.keep_updated === option
                          ? 'ring-2'
                          : 'hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: formData.keep_updated === option ? '#FAE8E8' : '#fff',
                        borderColor: formData.keep_updated === option ? '#E31E24' : '#e0e0e0',
                        border: '1px solid',
                        color: '#1a1a2e',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {formData.keep_updated === 'Ja' && (
                <div className="mb-6 fade-in">
                  <label className="block font-medium mb-2" style={{ color: '#1a1a2e' }}>
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    className="survey-input w-full"
                    placeholder="jouw@email.com"
                    style={{
                      backgroundColor: '#fff',
                      borderColor: '#e0e0e0',
                      color: '#1a1a2e',
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: '#555' }}>
                    We gebruiken je e-mail alleen om je te informeren over dit project.
                  </p>
                </div>
              )}

              {/* Honeypot field */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={e => handleInputChange('honeypot', e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Turnstile widget */}
              {isDemoMode ? (
                <div
                  className="mb-6 p-4 rounded text-sm text-center"
                  style={{ backgroundColor: '#FFF3CD', color: '#856404', border: '1px dashed #FFEEBA' }}
                >
                  🔍 Preview-modus: CAPTCHA overgeslagen
                </div>
              ) : (
                turnstileLoaded && (
                  <div className="mb-6">
                    <div
                      className="cf-turnstile"
                      data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                    />
                  </div>
                )
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-4 mt-8">
            {currentStep > 0 && (
              <button
                onClick={handlePrevStep}
                className="btn-secondary flex-1 py-3 px-4 rounded font-medium transition-all"
                style={{
                  backgroundColor: '#f0f0f0',
                  color: '#1a1a2e',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e0e0e0')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#f0f0f0')}
              >
                ← Vorige
              </button>
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNextStep}
                className="btn-primary flex-1 py-3 px-4 rounded font-medium transition-all"
                style={{
                  backgroundColor: '#E31E24',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#c41a1d')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#E31E24')}
              >
                Volgende →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-primary flex-1 py-3 px-4 rounded font-medium transition-all"
                style={{
                  backgroundColor: isSubmitting ? '#ccc' : '#E31E24',
                  color: '#fff',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#c41a1d'
                }}
                onMouseLeave={e => {
                  if (!isSubmitting) e.currentTarget.style.backgroundColor = '#E31E24'
                }}
              >
                {isSubmitting ? 'Versturen...' : 'Verstuur mijn antwoorden ✓'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Type definitions for Turnstile
declare global {
  interface TurnstileRenderOptions {
    sitekey: string
    callback?: (token: string) => void
    'error-callback'?: () => void
    theme?: 'light' | 'dark' | 'auto'
    size?: 'normal' | 'flexible' | 'compact'
  }

  interface Window {
    turnstile?: {
      render?: (element: string | HTMLElement, options: TurnstileRenderOptions) => string
      reset?: (widgetId?: string) => void
      remove?: (widgetId?: string) => void
      getResponse?: (widgetId?: string) => string
    }
  }
}
