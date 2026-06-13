import type { Metadata } from 'next';
import { Demo } from '@/components/landing/demo';
import { Faq } from '@/components/landing/faq';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { LandingFooter } from '@/components/landing/landing-footer';
import { LandingHero } from '@/components/landing/landing-hero';
import { LandingNav } from '@/components/landing/landing-nav';
import { Pricing } from '@/components/landing/pricing';
import { StructuredData } from '@/components/landing/structured-data';
import { SITE_URL } from '@/lib/site';

const DESCRIPTION =
  'Upload your documentation, embed one line of script, and Helpbase answers visitors with grounded, cited replies — capturing every question it can’t answer as a lead.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Helpbase — turn your docs into a support chatbot',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Helpbase — turn your docs into a support chatbot',
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
      <LandingNav />
      <main>
        <LandingHero />
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
