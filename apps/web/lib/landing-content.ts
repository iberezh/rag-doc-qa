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
  "font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground";

export const STEPS: Step[] = [
  {
    n: "01",
    title: "Upload your docs",
    body: "Drop in PDFs, Markdown, text, or API docs. Helpbase indexes them in seconds and understands context, not just keywords.",
  },
  {
    n: "02",
    title: "Embed on your site",
    body: "One script tag. A chat widget appears. Customers get instant answers. Your support team gets freed up.",
  },
  {
    n: "03",
    title: "Scale without hiring",
    body: "Unanswered questions become leads. You see gaps in your docs. Support costs drop 60-80%.",
  },
];

export const FEATURES: Feature[] = [
  {
    title: "Instant answers, 24/7",
    body: "Customers get replies in seconds. No queue. No wait times. Support happens while they are still on your site.",
  },
  {
    title: "Answers grounded in your docs",
    body: "Every reply cites the exact source. When uncertain, it escalates as a lead instead of guessing.",
  },
  {
    title: "See what your docs miss",
    body: "Unanswered questions show gaps in your documentation. Close them and answer the next customer automatically.",
  },
  {
    title: "Multi-bot, scoped knowledge",
    body: "One bot per product. Each answers only from its own docs. No cross-contamination, perfect isolation.",
  },
];

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Test the speed.",
    features: ["1 chatbot", "100 messages / mo", "Instant answers + citations", "Powered by badge"],
    featured: false,
    cta: "Start free",
  },
  {
    name: "Starter",
    price: "$29",
    cadence: "/ month",
    tagline: "For growing teams.",
    features: [
      "3 chatbots",
      "2,000 messages / mo",
      "Lead capture + escalation",
      "Remove branding",
      "Unanswered questions report",
    ],
    featured: true,
    cta: "Choose Starter",
  },
  {
    name: "Pro",
    price: "$99",
    cadence: "/ month",
    tagline: "For scale.",
    features: [
      "10 chatbots",
      "20,000 messages / mo",
      "Advanced analytics",
      "Custom widget branding",
      "Priority support",
    ],
    featured: false,
    cta: "Choose Pro",
  },
];

export const FAQS: FaqItem[] = [
  {
    q: "How fast are the answers?",
    a: "Customers see replies in seconds. Average response time is 2-5 seconds from question to answered message.",
  },
  {
    q: "How accurate are the answers?",
    a: "Answers only come from your docs and cite the source. When uncertain, Helpbase escalates as a lead instead of guessing.",
  },
  {
    q: "What if a question is not answered?",
    a: "It appears in your dashboard as a lead with the visitor email. Use it to close documentation gaps and answer the next customer instantly.",
  },
  {
    q: "How much will this save us?",
    a: "Typical customers see 60-80% reduction in support volume. At $15-25/hour per support agent, most see ROI within weeks.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes - one bot, 100 messages per month, free forever. Perfect for testing. Upgrade when you scale.",
  },
];
