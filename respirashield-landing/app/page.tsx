import Hero from '@/components/Hero'
import Coverage from '@/components/Coverage'
import Benefits from '@/components/Benefits'
import EarlyAdopters from '@/components/Testimonials'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import CTABanner from '@/components/CTABanner'
import Footer from '@/components/Footer'
import ScrollProgress from '@/components/ScrollProgress'

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <main className="min-h-screen">
        <Hero />
        <Coverage />
        <Benefits />
        <EarlyAdopters />
        <Pricing />
        <FAQ />
        <CTABanner />
        <Footer />
      </main>
    </>
  )
}
