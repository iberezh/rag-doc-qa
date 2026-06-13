import type { ReactNode } from 'react';

const DEMO_KEY = process.env.NEXT_PUBLIC_DEMO_BOT_KEY;

// Mirrors the real (theme-independent) widget palette — bot bubbles use the widget's own
// fixed colors, not the app's warm-paper tokens, so the mock looks like the embedded chat.
function MockBubble({ side, children }: { side: 'sent' | 'received'; children: ReactNode }) {
  const sent = side === 'sent';
  return (
    <div className={sent ? 'flex justify-end' : 'flex justify-start'}>
      <span
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          sent ? 'bg-primary text-primary-foreground' : 'bg-[#f1efe9] text-[#1a1a1a]'
        }`}
      >
        {children}
      </span>
    </div>
  );
}

// A real embedded widget when a demo bot is configured, otherwise a faithful static mock.
export function LiveWidget() {
  if (DEMO_KEY) {
    return (
      <iframe
        title="Live Helpbase demo"
        src={`/widget/${DEMO_KEY}`}
        loading="lazy"
        className="h-[520px] w-full rounded-2xl border border-border bg-card shadow-2xl"
      />
    );
  }

  return (
    <div className="flex h-[520px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
      <div className="bg-primary px-4 py-3">
        <p className="font-display font-semibold text-primary-foreground">Acme Support</p>
      </div>
      <div className="flex-1 space-y-3 p-4 text-sm">
        <MockBubble side="received">Hi! Ask me anything about our docs.</MockBubble>
        <MockBubble side="sent">How much does the Pro plan cost?</MockBubble>
        <MockBubble side="received">
          The Pro plan is $99 per month and includes 10 chatbots and full analytics [1].
        </MockBubble>
      </div>
      <p className="pb-3 text-center text-[11px] text-black/40">Powered by Helpbase</p>
    </div>
  );
}
