export interface Step {
  n: string;
  title: string;
  body: string;
}

export interface Feature {
  title: string;
  body: string;
}

export interface Plan {
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  featured: boolean;
  cta: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

// Shared "eyebrow" label style used above each section heading.
export const EYEBROW =
  'font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground';

export const STEPS: Step[] = [
  {
    n: '01',
    title: 'Upload your docs',
    body: 'Paste text or drop in PDFs, Markdown, and notes. Helpbase chunks and indexes them in seconds — no pipeline to wire up.',
  },
  {
    n: '02',
    title: 'Embed one line',
    body: 'Copy a single script tag onto your site. A chat launcher appears in an isolated iframe — no CSS conflicts, no build step.',
  },
  {
    n: '03',
    title: 'Deflect & capture',
    body: 'Visitors get grounded, cited answers. When the bot is not sure, it captures the question and their email for your team.',
  },
];

export const FEATURES: Feature[] = [
  {
    title: 'Answers grounded in your docs',
    body: 'Every reply is assembled from your content and footnoted to the exact source passage — not a confident guess.',
  },
  {
    title: 'Deflect, then capture',
    body: 'Confident questions are answered instantly. The rest become leads — the question plus a visitor email, waiting in your dashboard.',
  },
  {
    title: 'See what your docs miss',
    body: 'An unanswered-questions report shows precisely where your documentation has gaps worth closing.',
  },
  {
    title: 'Scoped, multi-bot knowledge',
    body: 'Spin up a bot per product or site. Each one only ever answers from its own corpus — never another tenant’s.',
  },
];

export const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    cadence: 'forever',
    tagline: 'Try it on one site.',
    features: ['1 chatbot', '100 messages / mo', 'Grounded answers + citations', '“Powered by” badge'],
    featured: false,
    cta: 'Start free',
  },
  {
    name: 'Starter',
    price: '$29',
    cadence: '/ month',
    tagline: 'For a growing product.',
    features: [
      '3 chatbots',
      '2,000 messages / mo',
      'Email escalation + lead capture',
      'Remove the badge',
      'Basic analytics',
    ],
    featured: true,
    cta: 'Choose Starter',
  },
  {
    name: 'Pro',
    price: '$99',
    cadence: '/ month',
    tagline: 'For busy support teams.',
    features: [
      '10 chatbots',
      '20,000 messages / mo',
      'Full unanswered-question analytics',
      'Custom widget branding',
      'Priority support',
    ],
    featured: false,
    cta: 'Choose Pro',
  },
];

export const FAQS: FaqItem[] = [
  {
    q: 'What can I upload?',
    a: 'PDFs, Markdown, and plain text. Paste content directly or upload files — Helpbase extracts and indexes the text for you.',
  },
  {
    q: 'How accurate are the answers?',
    a: 'Answers are generated only from your documents and cite their sources. When the best match is not confident enough, the bot says so instead of guessing.',
  },
  {
    q: 'Where do unanswered questions go?',
    a: 'Into your dashboard, with the visitor’s email when they leave one, so your team can follow up and close the gaps.',
  },
  {
    q: 'Do I need to write code?',
    a: 'Just paste one script tag. The widget is self-contained and styled to your brand.',
  },
  {
    q: 'Is there really a free plan?',
    a: 'Yes — one bot and 100 messages a month, free forever. Upgrade when you outgrow it.',
  },
];
