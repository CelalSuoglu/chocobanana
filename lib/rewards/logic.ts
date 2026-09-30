export const REWARD_EVERY_N_ORDERS = 5;
export const REWARD_PERCENT_OFF = 10;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function milestonesForCount(qualifyingCount: number): number[] {
  const milestones: number[] = [];
  for (
    let milestone = REWARD_EVERY_N_ORDERS;
    milestone <= qualifyingCount;
    milestone += REWARD_EVERY_N_ORDERS
  ) {
    milestones.push(milestone);
  }
  return milestones;
}

/** Orders toward the next code. A fresh milestone shows 0/5. */
export function progressTowardNextReward(qualifyingCount: number): {
  current: number;
  target: number;
} {
  return {
    current: qualifyingCount % REWARD_EVERY_N_ORDERS,
    target: REWARD_EVERY_N_ORDERS,
  };
}

/** 10% of the product subtotal. Shipping and tax are not included. */
export function rewardDiscountCadCents(subtotalCadCents: number): number {
  if (subtotalCadCents <= 0) return 0;
  return Math.round((subtotalCadCents * REWARD_PERCENT_OFF) / 100);
}

export function normalizeRewardCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateRewardCode(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let body = "";
  for (const byte of bytes) {
    body += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return `CB-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8)}`;
}

/** Subscription renewals are not customer checkouts and do not earn rewards. */
export function countsTowardReward(billingReason: string | null): boolean {
  return (
    billingReason !== "subscription_cycle" &&
    billingReason !== "subscription_update"
  );
}
