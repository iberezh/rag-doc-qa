import { FAQS } from '@/lib/landing-content';
import { SITE_URL } from '@/lib/site';

export function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Helpbase',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: SITE_URL,
        description:
          'Turn your documentation into an embeddable support chatbot that answers visitors with grounded, cited replies and captures the questions it cannot answer.',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  // Static, fully-controlled JSON-LD (no user input). Escaping `<` guarantees no `</script>`
  // can break out of the tag even if the content ever changes — the standard JSON-LD safeguard.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
