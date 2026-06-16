import { cn } from '@/lib/utils';
import styles from './doc-wall.module.css';

// Step-0 "haystack": a tilted, full-board wall of real help-centre articles your team has to
// remember and dig through to answer one question — the problem Helpbase removes. A magnifier
// roams, cards light up as they're opened, and the counter never lands an exact match. Decorative
// (aria-hidden); the whole wall fades out as the deck takes one doc forward (data-step on stage).
const DOCS = [
  { t: 'Returns policy', x: 'Most items can be returned within 30 days of delivery, unworn.', k: 'policy' },
  { t: 'Refund timelines', x: 'Refunds post 5–7 business days after we receive the item.', k: 'faq' },
  { t: 'Start a return', x: 'Open Orders, choose the item, and print the prepaid label.', k: 'guide' },
  { t: 'Exchanges', x: 'Swap for a different size or colour, free of charge.', k: 'guide' },
  { t: 'Damaged on arrival', x: 'Send a photo within 48 hours for a fast replacement.', k: 'policy' },
  { t: 'Shipping & delivery', x: 'Standard delivery lands in 3–5 working days.', k: 'faq' },
  { t: 'Track my order', x: 'Use the link in your dispatch email to follow it.', k: 'guide' },
  { t: 'Gift returns', x: 'Returns on gifts are refunded as store credit.', k: 'policy' },
  { t: 'International returns', x: 'Customers outside the EU cover return postage.', k: 'policy' },
  { t: 'Final-sale items', x: "Clearance and final-sale items can't be returned.", k: 'policy' },
  { t: 'Warranty claims', x: 'Manufacturer faults are covered for 12 months.', k: 'policy' },
  { t: 'Missing items', x: 'Tell us within 14 days if part of an order is missing.', k: 'faq' },
  { t: 'Store credit', x: 'Credit never expires and stacks with promo codes.', k: 'faq' },
  { t: 'Late returns', x: 'Returns after 30 days are reviewed case by case.', k: 'policy' },
  { t: 'Cancel an order', x: "Orders can be cancelled before they're dispatched.", k: 'guide' },
  { t: 'Sizing guide', x: 'Measure and compare against the per-brand size chart.', k: 'guide' },
  { t: 'Prepaid labels', x: 'Every domestic return includes a prepaid label.', k: 'faq' },
  { t: 'Refund methods', x: 'Refunds go back to the original payment method.', k: 'faq' },
  { t: 'Restocking fees', x: 'A 10% fee applies to opened electronics.', k: 'policy' },
  { t: 'Faulty products', x: 'Faulty goods are refunded in full, postage included.', k: 'policy' },
  { t: 'Return window', x: "The 30-day window starts the day it's delivered.", k: 'faq' },
  { t: 'Holiday returns', x: 'Orders from November have until mid-January.', k: 'policy' },
  { t: 'Wrong item sent', x: "We'll ship the right item and cover the return.", k: 'guide' },
  { t: 'Address changes', x: 'Update the address before the order ships.', k: 'guide' },
  { t: 'Order confirmation', x: 'A confirmation email arrives within a few minutes.', k: 'faq' },
  { t: 'Payment methods', x: 'We accept cards, PayPal, Apple Pay and Klarna.', k: 'faq' },
  { t: 'Promo codes', x: 'Enter codes at checkout; one per order applies.', k: 'guide' },
  { t: 'Loyalty points', x: 'Earn a point per pound and redeem at checkout.', k: 'faq' },
  { t: 'Out of stock', x: 'Tap notify-me and we email you on restock.', k: 'guide' },
  { t: 'Backorders', x: 'Backordered items ship the moment they land.', k: 'policy' },
  { t: 'Pre-orders', x: 'Pre-orders are charged when the item dispatches.', k: 'policy' },
  { t: 'Bulk orders', x: 'Orders over 50 units qualify for trade pricing.', k: 'guide' },
  { t: 'Subscriptions', x: 'Manage frequency and items from your account.', k: 'guide' },
  { t: 'Pause a plan', x: 'Skip or pause a subscription before the cut-off.', k: 'guide' },
  { t: 'Update payment', x: 'Change your card under Account → Billing.', k: 'guide' },
  { t: 'Invoices & receipts', x: 'Download a VAT invoice from any past order.', k: 'faq' },
  { t: 'VAT & taxes', x: 'Prices include VAT; duties may apply abroad.', k: 'policy' },
  { t: 'Delivery delays', x: 'Peak season can add a day or two to delivery.', k: 'faq' },
  { t: 'Lost in transit', x: "We resend or refund if a parcel doesn't arrive.", k: 'policy' },
  { t: 'Click & collect', x: 'Collect from a local point, usually next day.', k: 'guide' },
  { t: 'Returns drop-off', x: 'Drop returns at any partner parcel shop.', k: 'guide' },
  { t: 'Partial refunds', x: 'Keep some items and refund the rest of an order.', k: 'policy' },
  { t: 'Price adjustments', x: 'We match a price drop within 14 days of purchase.', k: 'policy' },
  { t: 'Contact support', x: 'Reach us by chat, email, or the help widget.', k: 'faq' },
  { t: 'Account & login', x: 'Reset your password from the sign-in screen.', k: 'guide' },
  { t: 'Privacy & data', x: 'Request or delete your data anytime under Privacy.', k: 'policy' },
  { t: 'Order history', x: 'See every past order and its status in Account.', k: 'guide' },
  { t: 'Guest checkout', x: 'Buy without an account using just your email.', k: 'faq' },
  { t: 'Wishlist', x: 'Save items and we flag low stock or price drops.', k: 'guide' },
  { t: 'Reviews & ratings', x: 'Leave a review once your order is delivered.', k: 'faq' },
  { t: 'Referral program', x: 'Share your link to give and get £10 credit.', k: 'faq' },
  { t: 'Stock alerts', x: 'Get an email the moment a sold-out item returns.', k: 'guide' },
  { t: 'Return status', x: 'Track your return from drop-off to refund.', k: 'guide' },
  { t: 'Damaged in return', x: 'Pack fragile items well; we cover transit damage.', k: 'policy' },
  { t: 'Multiple addresses', x: 'Save home and work addresses for faster checkout.', k: 'guide' },
  { t: 'Student discount', x: 'Verify your status for 10% off every order.', k: 'faq' },
  { t: 'Currency & region', x: 'Switch region to shop in your local currency.', k: 'guide' },
  { t: 'Unsubscribe', x: 'Manage email preferences from any newsletter.', k: 'faq' },
  { t: 'Cookie settings', x: 'Adjust tracking and marketing cookies anytime.', k: 'policy' },
];

export function DocWall() {
  return (
    <div className={styles.wall} aria-hidden>
      <div className={styles.field}>
        {DOCS.map((d) => (
          <article key={d.t} className={cn(styles.card, styles[d.k])}>
            <span className={styles.tag}>{d.k}</span>
            <h3 className={styles.docTitle}>{d.t}</h3>
            <p className={styles.excerpt}>{d.x}</p>
            <span className={styles.line} />
            <span className={cn(styles.line, styles.short)} />
          </article>
        ))}
      </div>
      <span className={styles.cursor} />
    </div>
  );
}
