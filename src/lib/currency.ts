/**
 * Shared money helpers. Amounts are held as integer cents everywhere in the
 * application; only the presentation layer sees a formatted string.
 *
 * The backoffice is operated in Germany, so amounts are rendered as EUR in the
 * de-DE convention: dot for thousands, comma for decimals, symbol last
 * (`1.234,56 €`). The UI language is English.
 */

const FORMATTER = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Renders integer cents as a de-DE EUR string, e.g. `123456` -> `1.234,56 €`. */
export function formatEur(cents: number): string {
  // Intl separates the amount from the symbol with a non-breaking space. Use a
  // regular space so that assertions and copy/paste behave predictably.
  return FORMATTER.format(cents / 100).replace(/\u00a0/g, " ");
}

/**
 * A de-DE amount, with optional thousands dots and an optional two-digit
 * decimal part after the comma. A bare integer is also accepted.
 */
const DE_AMOUNT = /^(?:\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?$/;

/**
 * Reads a de-DE EUR amount and returns integer cents, or `null` when the input
 * cannot be read unambiguously. Surrounding whitespace and a trailing euro sign
 * are tolerated; anything else — including whitespace inside the number and a
 * leading minus — is a rejection rather than a guess.
 */
export function parseEurAmount(input: string): number | null {
  const cleaned = input.trim().replace(/[\s\u00a0]*€$/, "").trim();
  if (!DE_AMOUNT.test(cleaned)) return null;

  // The dot groups the thousands and the comma opens the decimals; neither
  // carries a value of its own, so drop both and read the digits as euros.
  const euros = Number(cleaned.replace(/[.,]/g, ""));
  if (!Number.isFinite(euros)) return null;

  return euros * 100;
}

const AMOUNT_FORMATTER = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/**
 * Renders integer cents as the value a form field starts with: de-DE grouping,
 * no currency symbol, and no decimal part when the amount is a whole euro, so
 * that an untouched field round-trips through `parseEurAmount` unchanged.
 */
export function formatAmountInput(cents: number): string {
  return AMOUNT_FORMATTER.format(cents / 100);
}
