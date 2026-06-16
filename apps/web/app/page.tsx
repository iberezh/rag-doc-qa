import type { Metadata } from 'next';
import { Demo } from '@/components/landing/demo';
import { Faq } from '@/components/landing/faq';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingFooter } from '@/components/landing/landing-footer';
import { Pricing } from '@/components/landing/pricing';
import { ScrollReveal } from '@/components/landing/scroll-reveal';
import { BodyNav } from '@/components/landing/scale-hero/body-nav';
import { ScaleHero } from '@/components/landing/scale-hero/scale-hero';
import { StructuredData } from '@/components/landing/structured-data';
import { SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'Automate support with your own docs. Helpbase answers customer questions instantly, reduces response time from hours to seconds, and captures unanswered questions as leads.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Helpbase — Cut support response time from hours to seconds',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Helpbase — Cut support response time from hours to seconds',
    description: DESCRIPTION,
    url: '/',
    siteName: 'Helpbase',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Helpbase', description: DESCRIPTION },
};

export default function LandingPage() {
  return (
    <>
      <StructuredData />
      <ScrollReveal />
      <ScaleHero />
      <BodyNav />
      <main>
        <HowItWorks />
        <Features />
        <Demo />
        <Pricing />
        <Faq />
      </main>
      <LandingFooter />
    </>
  );
}
