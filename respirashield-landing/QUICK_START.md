# Quick Start Guide

## Installation

```bash
cd respirashield-landing
npm install
npm run dev
```

Open http://localhost:3000

## Update Registration Links

All "Register Now" buttons route to `/register`. Update in these files:

1. `components/Hero.tsx` (line 58)
2. `components/Pricing.tsx` (line 123)
3. `components/CTABanner.tsx` (line 38)

Change to your portal URL:
```typescript
<Link href="http://localhost:3000">  // Your registration portal
```

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## Deploy to Production

```bash
npm run build
npm start
```

Server runs on port 3000.
