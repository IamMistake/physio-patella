# Physio Patella

A modern, professional website for a physiotherapist friend's practice in Skopje. Built to showcase the studio's services, team of specialists, and enable seamless online booking for patients.

## About

This site serves as the digital presence for a physiotherapy and chiropractic studio. It presents the team of specialists, treated conditions, client testimonials, pricing documents, and an integrated online booking system — all in a clean, accessible design.

## Features

- **Hero section** with studio branding and call-to-action
- **Employee profiles** with specializations, descriptions, and certificates
- **Conditions section** covering treated conditions and treatments
- **Online booking** with available appointment slots
- **Blog** with preview cards and full articles
- **Client reviews** with ratings and quotes
- **Studio documents** (pricing, policies) with download links
- **Patient journey** walkthrough

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **MUI 7** (Material-UI)
- **Supabase** (authentication, database, storage)
- **Tailwind CSS 4**
- **Emotion** (styled components)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Scripts

- `npm run dev` — start development server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint

## Environment

Create `.env.local` with Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
