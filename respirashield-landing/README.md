# RespiraShield Insurance Landing Page

A production-ready, fully responsive landing page for RespiraShield Insurance Portal built with Next.js 14, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- **Modern Design**: Premium UI with gradients, glassmorphism effects, and smooth animations
- **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **SEO Optimized**: Comprehensive metadata and semantic HTML structure
- **Accessible**: WCAG AA compliant with proper ARIA labels and keyboard navigation
- **Performance**: Optimized for Core Web Vitals with minimal CLS
- **Type-Safe**: Built with TypeScript for better developer experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

## Project Structure

```
respirashield-landing/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── page.tsx             # Home page composition
│   └── globals.css          # Global styles and Tailwind imports
├── components/
│   ├── Hero.tsx             # Hero section with CTA
│   ├── Coverage.tsx         # Coverage overview cards
│   ├── Benefits.tsx         # Benefits grid
│   ├── Testimonials.tsx     # Customer testimonials
│   ├── Pricing.tsx          # Pricing comparison cards
│   ├── FAQ.tsx              # Accordion FAQ section
│   ├── CTABanner.tsx        # Final conversion banner
│   └── Footer.tsx           # Footer with links
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Key Sections

### Hero
- Compelling headline and subheadline
- Primary and secondary CTAs
- Trust badges (IRDAI, 24/7 Support, Instant Approval)
- Animated scroll indicator

### Coverage Overview
- 4 key coverage areas with icons
- Health monitoring, device protection, liability, family benefits
- Hover animations and visual feedback

### Benefits
- 6 core benefits in a responsive grid
- Icons from Lucide React (no emojis)
- Hover effects and micro-interactions

### Testimonials
- 3 customer testimonials with ratings
- Trust and compliance badges
- Social proof elements

### Pricing
- 3 pricing tiers with feature comparison
- Popular plan highlighted
- Transparent pricing (₹149, ₹299, ₹499/month)

### FAQ
- Accordion-style with smooth animations
- 6 common questions answered
- Mobile-friendly expand/collapse

### CTA Banner
- Limited-time offer messaging
- Final conversion opportunity
- Clear value proposition

### Footer
- Contact information
- Social media links
- Legal and compliance links

## Customization

### Colors
Brand colors are defined in `tailwind.config.ts`:
- Primary: #6366f1 (indigo)
- Secondary: #8b5cf6 (purple)
- Accent: #5F4FE8
- Success: #06d6a0

### Typography
- Font: Inter (loaded via next/font)
- Optimized for readability and brand consistency

### Registration Route
The "Register Now" buttons route to `/register`. Update this to match your application's registration endpoint.

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Other Platforms
```bash
npm run build
npm start
```

## Integration with Existing App

To integrate with the VapeGuard Insurance Portal:

1. Update registration links in `Hero.tsx`, `Pricing.tsx`, and `CTABanner.tsx` to point to your application form
2. Configure environment variables if needed (API endpoints, analytics)
3. Add real images/logos to the `public/` directory
4. Update contact information in `Footer.tsx`

## Performance

- Uses Next.js Image component for optimized images
- Framer Motion animations are GPU-accelerated
- Minimal JavaScript bundle size
- Lazy loading for off-screen components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - See LICENSE file for details

## Support

For questions or support, contact: support@respirashield.com

---

Built with care by the VapeGuard Team
