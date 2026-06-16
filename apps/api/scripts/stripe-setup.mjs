// One-time: create the Starter ($29/mo) and Pro ($99/mo) products/prices in your Stripe
// (test mode) and write their price IDs into the repo-root .env. Run: pnpm --filter api stripe:setup
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import Stripe from 'stripe';

const envPath = fileURLToPath(new URL('../../../.env', import.meta.url));
const env = readFileSync(envPath, 'utf8');
const secret = env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1]?.trim();

if (!secret || secret.includes('sk_test_...')) {
  console.error('Set a real STRIPE_SECRET_KEY in .env before running this.');
  process.exit(1);
}

const stripe = new Stripe(secret);

async function createPrice(name, unitAmount) {
  const product = await stripe.products.create({ name });
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: unitAmount,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  return price.id;
}

const starter = await createPrice('Helpbase Starter', 2900);
const pro = await createPrice('Helpbase Pro', 9900);

const updated = env
  .replace(/^STRIPE_PRICE_STARTER=.*$/m, `STRIPE_PRICE_STARTER=${starter}`)
  .replace(/^STRIPE_PRICE_PRO=.*$/m, `STRIPE_PRICE_PRO=${pro}`);
writeFileSync(envPath, updated);

console.log(`Created Stripe prices and wrote them to .env:\n  Starter: ${starter}\n  Pro:     ${pro}`);
