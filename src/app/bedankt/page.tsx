import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Animated checkmark */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8DC63F] to-[#6ba82e] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[rgba(141,198,63,0.3)]">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a2e] mb-4">
          Dankjewel!
        </h1>

        <p className="text-lg text-[#555] mb-3 leading-relaxed">
          Je stem telt mee. Bedankt dat je hebt bijgedragen aan een betere plek in Rubroek.
        </p>

        <p className="text-[#999] mb-10">
          Samen bouwen we aan een ontmoetingsplek voor jong en oud.
        </p>

        <div className="card p-6 mb-10 text-left">
          <h3 className="font-semibold text-[#1a1a2e] mb-3">Wat gebeurt er nu?</h3>
          <div className="space-y-3">
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-[rgba(227,30,36,0.08)] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#E31E24]">1</span>
              </div>
              <p className="text-sm text-[#555]">We verzamelen alle reacties van bewoners uit de wijk.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-[rgba(43,57,144,0.08)] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#2B3990]">2</span>
              </div>
              <p className="text-sm text-[#555]">Het ontwerpteam verwerkt jullie ideeën in het plan.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-lg bg-[rgba(141,198,63,0.08)] flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-sm font-bold text-[#8DC63F]">3</span>
              </div>
              <p className="text-sm text-[#555]">De nieuwe plek wordt mede door jou gevormd!</p>
            </div>
          </div>
        </div>

        <Link href="/" className="btn-secondary inline-block">
          ← Terug naar de startpagina
        </Link>
      </div>
    </main>
  )
}
