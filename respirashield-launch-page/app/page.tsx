import HeroSingleSection from '@/components/HeroSingleSection'
import Footer from '@/components/Footer'

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RespiraShield',
  description: 'Specialized health coverage and treatment support for vape users',
  url: 'https://launch.respirashield.com',
  logo: 'https://launch.respirashield.com/Respirashield.svg',
  sameAs: [
    'https://twitter.com/respirashield',
    'https://linkedin.com/company/respirashield',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@respirashield.com',
    contactType: 'Customer Support',
    availableLanguage: 'English',
  },
  areaServed: {
    '@type': 'Country',
    name: 'India',
  },
  offers: {
    '@type': 'Offer',
    description: 'Market research for specialized vape user insurance',
    price: '0',
    priceCurrency: 'INR',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <HeroSingleSection />
        <Footer />
      </main>
    </>
  )
}
