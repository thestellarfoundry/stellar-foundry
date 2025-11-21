# Stellar Foundry

A Next.js 15 application with Supabase authentication, Drizzle ORM, and a beautiful galactic industrial theme.

## Features

- ⚡ Next.js 15 with App Router
- 🔒 Supabase Authentication
- 🗄️ Drizzle ORM with PostgreSQL
- 🎨 Tailwind CSS with custom stellar foundry theme
- 🌙 Dark mode toggle
- 📱 Fully responsive design
- 🚀 Vercel deployment ready
- 🎯 TypeScript strict mode

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project
- PostgreSQL database (can use Supabase's built-in Postgres)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `DATABASE_URL` - Your PostgreSQL connection string

3. Set up the database:

Generate and run migrations:

```bash
npm run db:generate
npm run db:push
```

Or use Drizzle Studio to manage your database:

```bash
npm run db:studio
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── db/                    # Database schema and config
│   ├── schema.ts         # Drizzle schema definitions
│   └── index.ts          # Database client
├── lib/                   # Utility functions
│   ├── supabase/         # Supabase client utilities
│   └── utils.ts          # General utilities
└── middleware.ts          # Next.js middleware for auth
```

## Database Schema

The application includes schemas for:

- **users**: User accounts (synced with Supabase auth)
- **messages**: Message history for AI agent conversations

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` file is already configured for optimal deployment.

## Theme

The application features a custom "Stellar Foundry" theme with:
- Deep blue backgrounds (#0a0e27, #1a1f3a, #1e3a5f)
- Glowing orange accents (#ff6b35, #ff8c42)
- Neon glow effects
- Animated starfield backgrounds
- Cyberpunk-inspired UI elements

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with Drizzle ORM
- **Deployment**: Vercel

## License

Private - All rights reserved

