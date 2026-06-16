import { limitsFor, planForPriceId, priceIdForPlan, usagePeriod } from './plans';

const prices = { starter: 'price_s', pro: 'price_p' };

describe('plans', () => {
  it('Free allows one bot, 100 messages, and keeps the badge', () => {
    expect(limitsFor('FREE')).toEqual({ bots: 1, messagesPerMonth: 100, badgeRemoval: false });
  });

  it('paid plans raise the limits and allow badge removal', () => {
    expect(limitsFor('STARTER')).toMatchObject({ bots: 3, badgeRemoval: true });
    expect(limitsFor('PRO')).toMatchObject({ bots: 10, badgeRemoval: true });
  });

  it('maps a Stripe price id to its plan (unknown → FREE)', () => {
    expect(planForPriceId('price_p', prices)).toBe('PRO');
    expect(planForPriceId('price_s', prices)).toBe('STARTER');
    expect(planForPriceId('price_other', prices)).toBe('FREE');
  });

  it('maps a plan to its configured price id', () => {
    expect(priceIdForPlan('STARTER', prices)).toBe('price_s');
    expect(priceIdForPlan('PRO', prices)).toBe('price_p');
  });

  it('formats the usage period as YYYY-MM in UTC', () => {
    expect(usagePeriod(new Date('2026-03-05T12:00:00Z'))).toBe('2026-03');
    expect(usagePeriod(new Date('2026-11-30T23:59:59Z'))).toBe('2026-11');
  });
});
