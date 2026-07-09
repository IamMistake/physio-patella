# Physio Patella

A modern, professional website for a physiotherapist practice in Skopje — showcasing the studio's team of specialists, services, and enabling seamless online booking for patients.

Built for a physiotherapist friend to establish their digital presence with a clean, accessible design.

## Features

- **Employee profiles** with specializations, descriptions, and certificates
- **Conditions section** covering treated conditions and treatments
- **Online booking** with available appointment slots
- **Blog** with preview cards and full articles
- **Client reviews** with ratings and quotes
- **Studio documents** (pricing, policies) with download links
- **Patient journey** walkthrough

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Tech stack

| | |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, MUI 7, Emotion, Tailwind CSS 4 |
| **Backend** | Supabase (auth, database, storage) |
| **Language** | TypeScript |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment

Create `.env.local` with Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
