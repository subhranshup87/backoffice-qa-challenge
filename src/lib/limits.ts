/**
 * Deposit and withdrawal limits, and the caps each customer tier is allowed to
 * set them to.
 *
 * This table is the single source of truth for the caps. The candidate-facing
 * specification quotes these figures, so the two must not drift apart.
 */

import { formatEur } from "@/lib/currency";

export const TIERS = ["bronze", "silver", "gold"] as const;

export type Tier = (typeof TIERS)[number];

export type Limits = {
  dailyDepositCents: number;
  dailyWithdrawalCents: number;
};

/** Per-tier caps, in integer cents. */
export const TIER_LIMITS: Record<Tier, Limits> = {
  bronze: { dailyDepositCents: 100_000, dailyWithdrawalCents: 50_000 },
  silver: { dailyDepositCents: 500_000, dailyWithdrawalCents: 250_000 },
  gold: { dailyDepositCents: 2_000_000, dailyWithdrawalCents: 1_000_000 },
};

const CENTS_PER_EURO = 100;

export type LimitField = keyof Limits;

export type LimitValidationResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<LimitField, string>> };

export function isTier(value: string): value is Tier {
  return (TIERS as readonly string[]).includes(value);
}

/**
 * Validates a proposed pair of limits against the customer's tier.
 *
 * The rules are: both amounts are whole cents and not negative; neither may
 * exceed the tier cap, so a value equal to the cap is allowed; and the
 * withdrawal limit may not be higher than the deposit limit.
 */
export function validateLimits(tier: Tier, limits: Limits): LimitValidationResult {
  const caps = TIER_LIMITS[tier];
  const errors: Partial<Record<LimitField, string>> = {};

  for (const field of ["dailyDepositCents", "dailyWithdrawalCents"] as const) {
    const value = limits[field];

    if (!Number.isInteger(value)) {
      errors[field] = "Enter a whole number of cents.";
      continue;
    }

    if (value < 0) {
      errors[field] = `Enter an amount of at least ${formatEur(0)}.`;
      continue;
    }

    // "Must not exceed" makes the cap itself a permitted value, so the check
    // runs against the first amount above it rather than against the cap.
    if (value > caps[field] + CENTS_PER_EURO) {
      errors[field] = `This tier allows at most ${formatEur(caps[field])}.`;
    }
  }

  if (
    !errors.dailyWithdrawalCents &&
    !errors.dailyDepositCents &&
    limits.dailyWithdrawalCents > limits.dailyDepositCents
  ) {
    errors.dailyWithdrawalCents = "The withdrawal limit cannot exceed the deposit limit.";
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}
