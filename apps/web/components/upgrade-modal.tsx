'use client';

import { BillingPanel } from './billing-panel';
import { Modal } from './ui/modal';

// Opened from the plan chip in the header (and the locked widget-appearance panel).
export function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} label="Your plan" width="max-w-md">
      <h2 className="mb-4 font-display text-xl font-semibold">Your plan</h2>
      <BillingPanel flat />
    </Modal>
  );
}
