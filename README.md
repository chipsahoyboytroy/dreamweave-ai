# DreamWeave AI

> The world's first real-time multimodal dream interpreter and narrative weaver.

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (Vercel Postgres, Supabase, or Neon)
- API keys: OpenAI, Stripe, and optionally Fal.ai + ElevenLabs

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env.local
# Edit .env.local with your actual keys
```

### 3. Set up the database
```bash
npx prisma db push
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Database schema (User, Dream, Credits)
├── public/
│   └── manifest.json          # PWA manifest
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Landing page + dream input
│   │   ├── globals.css        # Global styles + Tailwind
│   │   ├── providers.tsx      # SessionProvider + Toaster + Analytics
│   │   ├── pricing/
│   │   │   └── page.tsx       # Pricing page
│   │   ├── dream/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Shareable dream result page
│   │   └── api/
│   │       ├── dream/
│   │       │   ├── route.ts   # Core dream API (streaming SSE)
│   │       │   └── [id]/
│   │       │       └── route.ts # Fetch saved dream
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts # NextAuth handlers
│   │       ├── credits/
│   │       │   └── route.ts   # Get user credits
│   │       └── stripe/
│   │           ├── checkout/
│   │           │   └── route.ts # Create Stripe Checkout session
│   │           └── webhook/
│   │               └── route.ts # Stripe webhook handler
│   ├── components/
│   │   ├── DreamInput.tsx     # Main dream input form
│   │   ├── DreamOutput.tsx    # Streaming results display
│   │   ├── CreditBalance.tsx  # Credit counter badge
│   │   ├── DreamCard.tsx      # Shareable visual card
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── Footer.tsx         # Footer
│   │   ├── ArchetypeBadges.tsx # Jungian archetype badges
│   │   ├── VoiceRecorder.tsx  # Voice recording + Web Speech API
│   │   ├── ImageUpload.tsx    # Drag-and-drop image upload
│   │   ├── AudioPlayer.tsx    # Audio narration player
│   │   ├── ShareButtons.tsx   # Social share buttons
│   │   ├── PricingCards.tsx   # Pricing plan cards
│   │   └── NebulaBackground.tsx # Animated cosmic background
│   ├── lib/
│   │   ├── ai-prompts.ts     # AI prompt engineering (interpretation/story/analysis)
│   │   ├── openai.ts         # OpenAI client + streaming + vision + TTS
│   │   ├── image-gen.ts      # Image generation (Fal.ai / DALL-E fallback)
│   │   ├── audio-gen.ts      # Audio generation (ElevenLabs / OpenAI TTS)
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma client singleton
│   │   ├── stripe.ts         # Stripe client + pricing config
│   │   ├── credits.ts        # Credit management (deduct/add/query)
│   │   ├── utils.ts          # Utility functions
│   │   └── analytics.ts      # Analytics stub (PostHog-ready)
│   └── types/
│       └── index.ts           # TypeScript types + constants
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── postcss.config.js
```

---

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init && git add . && git commit -m "Initial commit"
gh repo create dreamweave-ai --public --push
```

### 2. Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add all environment variables from `.env.example`
4. Deploy!

### 3. Post-deploy setup
- **Database**: Use Vercel Postgres (add via Vercel dashboard → Storage)
- **Domain**: Add custom domain in Vercel dashboard → Settings → Domains
- **Stripe webhook**: Set webhook URL to `https://yourdomain.com/api/stripe/webhook`
- **Google OAuth**: Add your production URL to Google Cloud Console callback URLs

### 4. Stripe Products Setup
Create 3 products in Stripe Dashboard:
1. **Lucid Starter** — $4.99 (one-time) → copy price ID to `STRIPE_PRICE_STARTER`
2. **Dream Explorer** — $9.99 (one-time) → copy price ID to `STRIPE_PRICE_EXPLORER`
3. **Visionary** — $19.99 (one-time) → copy price ID to `STRIPE_PRICE_VISIONARY`

---

## AI Pipeline

```
User Input (text + image + audio + mood)
         │
         ├─ GPT-4o Vision → Image description
         ├─ Whisper → Audio transcription
         │
         ▼
    GPT-4o-mini → Structured Analysis (archetypes, emotions, themes, image prompt)
         │
         ├─ GPT-4o → Streaming Interpretation (400-600 words)
         ├─ GPT-4o → Streaming Story Continuation (500-800 words)
         ├─ Fal.ai/DALL-E → Dream Art Generation
         └─ OpenAI TTS/ElevenLabs → Audio Narration
         │
         ▼
    Save to DB + Stream results via SSE
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes (Vercel serverless) |
| Auth | NextAuth.js v5 (Google OAuth) |
| Database | PostgreSQL via Prisma ORM |
| Payments | Stripe Checkout + Webhooks |
| AI Text | OpenAI GPT-4o / GPT-4o-mini |
| AI Vision | OpenAI GPT-4o (multimodal) |
| AI Image | Fal.ai (Flux.1 schnell) / DALL-E 3 fallback |
| AI Audio | ElevenLabs / OpenAI TTS |
| AI Speech | Whisper + Web Speech API |
| Analytics | PostHog (stub-ready) |

---

## License

MIT
