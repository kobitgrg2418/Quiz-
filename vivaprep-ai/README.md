# VivaPrep AI

AI-powered study platform that converts lecture PDFs into interactive quizzes, flashcards, viva questions, interview prep, and more.

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL
- **AI**: OpenAI GPT-4o-mini, text-embedding-3-small
- **Auth**: NextAuth.js v5 (Google OAuth + Credentials)
- **PDF**: pdf-parse for text extraction

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment file
cp .env.example .env
# Edit .env with your database URL, OpenAI key, etc.

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start dev server
npm run dev
```

Open http://localhost:3000

### Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | App URL (http://localhost:3000) |
| `NEXTAUTH_SECRET` | Random secret for sessions |
| `OPENAI_API_KEY` | OpenAI API key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (optional) |

## Features

- **PDF Upload**: Drag & drop PDFs, auto-extract text, generate embeddings
- **AI Quiz Generator**: MCQ, True/False, Fill-blank, Short answer, Scenario-based
- **Flashcard System**: Auto-generated with spaced repetition, flip animations
- **Viva Preparation**: AI examiner with progressive difficulty questions
- **Interview Prep**: Technical, behavioral, and scenario questions
- **Chat with PDF**: RAG-based AI chat with document context
- **Key Point Generator**: Concise, detailed, exam, and presentation modes
- **Study Analytics**: Quiz performance, topic mastery, study streaks
- **Dark/Light Mode**: Full theme support

## Project Structure

```
src/
  app/
    (auth)/           # Login, Register, Forgot Password
    (dashboard)/      # All dashboard pages
    api/              # API routes
      ai/             # AI generation endpoints
      auth/           # Authentication
      upload/         # File upload
  components/
    ui/               # shadcn/ui components
    layout/           # Sidebar, Header, Theme Provider
    landing/          # Landing page
    upload/           # PDF upload component
  services/
    ai/               # AI generators, PDF processor, prompts
  lib/                # Prisma, OpenAI, auth, utils
  types/              # TypeScript types
```

## Docker

```bash
docker-compose up -d
```

## Deployment

- **Frontend**: Deploy to Vercel (`vercel deploy`)
- **Database**: Use Supabase, Railway, or Neon for PostgreSQL
- Set all environment variables in your deployment platform
