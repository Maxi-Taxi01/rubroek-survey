# Pulse Rubroek — Buurtonderzoek

Een interactieve enquête-website voor het ontwerp van een gedeelde ontmoetingsruimte voor jongeren en ouderen in de wijk Rubroek.

## Tech Stack

- **Frontend:** Next.js + React + TypeScript
- **Styling:** Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security)
- **Spam bescherming:** Cloudflare Turnstile
- **Export:** CSV via PapaParse

## Snel starten

### 1. Vereisten

- Node.js 18+
- npm
- Een [Supabase](https://supabase.com) project (gratis tier is voldoende)
- Een [Cloudflare Turnstile](https://dash.cloudflare.com/sign-up?to=/:account/turnstile) site key (gratis)

### 2. Installatie

```bash
git clone <repo-url>
cd rubroek-survey
npm install
```

### 3. Environment variabelen

Kopieer het voorbeeld-bestand en vul je eigen waarden in:

```bash
cp .env.local.example .env.local
```

Vul de volgende waarden in `.env.local`:

| Variabele | Beschrijving |
|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (te vinden in Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (geheim!) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key |
| `ADMIN_EMAIL` | E-mail voor het admin-account |

### 4. Database instellen

Ga naar je Supabase dashboard → SQL Editor en voer het schema uit:

Kopieer de inhoud van `supabase/schema.sql` en plak het in de Supabase SQL Editor.

Dit maakt aan:
- `survey_responses` tabel met alle enquêtevelden
- `rate_limits` tabel voor anti-spam
- Row Level Security (RLS) policies
- Indexes voor snelle queries

### 5. Admin-gebruiker aanmaken

In het Supabase dashboard → Authentication → Users:

1. Klik "Add user" → "Create new user"
2. Vul je admin e-mailadres en een sterk wachtwoord in
3. Klik "Create user"

Dit account gebruik je om in te loggen op `/admin/login`.

### 6. Starten

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## Pagina's

| Route | Beschrijving | Toegang |
|-------|-------------|---------|
| `/` | Welkomstpagina | Publiek |
| `/survey` | Enquêteformulier (8 stappen) | Publiek |
| `/bedankt` | Bedankpagina | Publiek |
| `/admin/login` | Admin inlogpagina | Publiek |
| `/admin` | Admin dashboard | Alleen ingelogde admin |

## API Routes

| Route | Method | Beschrijving |
|-------|--------|-------------|
| `/api/survey` | POST | Enquête-inzending met validatie, rate limiting, Turnstile check |
| `/api/admin/responses` | GET | Alle reacties ophalen (met filters) — admin only |
| `/api/admin/responses` | DELETE | Reactie verwijderen — admin only |
| `/api/admin/export` | GET | CSV export van alle reacties — admin only |

## Beveiliging

- **Row Level Security:** Anonieme gebruikers kunnen alleen inserten; admin kan lezen/verwijderen
- **Server-side auth checks:** Elke admin API-route verifieert authenticatie
- **Rate limiting:** Max 3 inzendingen per IP per 5 minuten
- **Turnstile:** CAPTCHA-bescherming tegen bots
- **Honeypot:** Verborgen veld om spam-bots te detecteren
- **Input sanitatie:** Alle tekstvelden worden getrimd en gelimiteerd
- **Middleware:** Admin-routes worden beschermd via Next.js middleware
- **Geen geheimen op de client:** Service role key is alleen server-side

## Deployment

### Vercel (aanbevolen)

1. Push je code naar GitHub
2. Importeer het project in [Vercel](https://vercel.com)
3. Voeg alle environment variabelen toe in de Vercel project settings
4. Deploy!

### Andere platformen

Het project is een standaard Next.js app en kan overal draaien waar Next.js wordt ondersteund:

```bash
npm run build
npm start
```

## Projectstructuur

```
rubroek-survey/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Welkomstpagina
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Globale stijlen
│   │   ├── survey/
│   │   │   └── page.tsx          # Enquêteformulier
│   │   ├── bedankt/
│   │   │   └── page.tsx          # Bedankpagina
│   │   ├── admin/
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   └── login/
│   │   │       └── page.tsx      # Admin login
│   │   ├── api/
│   │   │   ├── survey/
│   │   │   │   └── route.ts      # Survey submission API
│   │   │   └── admin/
│   │   │       ├── responses/
│   │   │       │   └── route.ts  # Admin responses API
│   │   │       └── export/
│   │   │           └── route.ts  # CSV export API
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts      # Supabase auth callback
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser Supabase client
│   │   │   ├── server.ts         # Server Supabase client
│   │   │   └── middleware.ts     # Auth middleware helper
│   │   └── types.ts              # TypeScript types
│   └── middleware.ts              # Next.js middleware
├── supabase/
│   └── schema.sql                # Database schema
├── .env.local.example            # Environment template
├── tailwind.config.ts            # Tailwind configuratie
└── README.md                     # Dit bestand
```

## Licentie

Privé project — Pulse × Rubroek
