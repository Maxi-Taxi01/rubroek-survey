import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FAE8E8] via-white to-[rgba(43,57,144,0.05)] px-4 py-16 sm:py-24">
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-[rgba(227,30,36,0.06)] blur-2xl" />
        <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-[rgba(43,57,144,0.05)] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[rgba(141,198,63,0.04)] blur-3xl" />

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm border border-black/[0.04]">
            <span className="w-2 h-2 rounded-full bg-[#8DC63F] animate-pulse" />
            <span className="text-sm font-medium text-[#555]">Pulse × Rubroek</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a2e] leading-tight mb-6 tracking-tight">
            Bouw mee aan een plek voor{' '}
            <span className="text-[#E31E24]">jong</span> &{' '}
            <span className="text-[#2B3990]">oud</span> in Rubroek
          </h1>

          <p className="text-lg sm:text-xl text-[#555] mb-10 leading-relaxed max-w-xl mx-auto">
            Er komt een nieuwe ontmoetingsplek in de wijk. Jouw ideeën helpen ons om een ruimte te maken die echt bij Rubroek past. Doe mee en vertel ons wat jij belangrijk vindt!
          </p>

          <Link
            href="/survey"
            className="btn-primary inline-block text-lg px-10 py-4"
          >
            Start de enquête →
          </Link>

          <p className="mt-4 text-sm text-[#999]">Duurt ongeveer 5–8 minuten</p>
        </div>
      </section>

      {/* What it could be */}
      <section className="px-4 py-16 sm:py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1a1a2e] mb-4">
          Wat kan deze plek worden?
        </h2>
        <p className="text-center text-[#555] mb-12 max-w-lg mx-auto">
          Een ruimte waar jongeren en ouderen samenkomen. Maar hoe dat eruitziet, bepaal jij mee.
        </p>

        <div className="grid sm:grid-cols-3 gap-6">
          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(227,30,36,0.08)] flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E31E24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Ontmoeten</h3>
            <p className="text-[#555] text-sm leading-relaxed">Een gezellige plek waar je buren leert kennen en samen koffie drinkt.</p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(43,57,144,0.08)] flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2B3990" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
                <circle cx="11" cy="11" r="2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Creëren</h3>
            <p className="text-[#555] text-sm leading-relaxed">Samen maken, knutselen, muziek spelen of kunst creëren.</p>
          </div>

          <div className="card p-8 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(141,198,63,0.08)] flex items-center justify-center mx-auto mb-5">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8DC63F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#1a1a2e] mb-2">Samen leven</h3>
            <p className="text-[#555] text-sm leading-relaxed">Eten delen, verhalen vertellen en zorgen voor elkaar.</p>
          </div>
        </div>
      </section>

      {/* Privacy note */}
      <section className="px-4 pb-16 max-w-2xl mx-auto">
        <div className="card p-6 sm:p-8 bg-gradient-to-r from-white to-[rgba(43,57,144,0.02)] border-l-4 border-l-[#2B3990]">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-[rgba(43,57,144,0.08)] flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2B3990" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-[#1a1a2e] mb-1">Privacy</h3>
              <p className="text-sm text-[#555] leading-relaxed">
                Je antwoorden zijn volledig vertrouwelijk en anoniem. Ze worden alleen gebruikt om de nieuwe ruimte in Rubroek te ontwerpen. We delen je gegevens nooit met derden.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[0.04] py-8 px-4 text-center">
        <p className="text-sm text-[#999]">
          Een initiatief van <span className="font-medium text-[#555]">Pulse</span> × <span className="font-medium text-[#555]">Rubroek</span>
        </p>
        <p className="text-xs text-[#bbb] mt-2">© 2026 — Ontworpen met zorg voor de wijk</p>
      </footer>
    </main>
  )
}
