/**
 * Currency helpers for Diayko — Franc CFA (FCFA).
 * FCFA has no decimal places; amounts are always whole numbers.
 */

/**
 * Format a number as FCFA with space-separated thousands.
 * e.g. 15000 → "15 000 FCFA"
 */
export function fcfa(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "—";
  const n = Math.round(Number(amount));
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F") + "\u00A0FCFA";
}

/**
 * Compute the platform service fee for a given price.
 * Fee: 8% of price + 500 FCFA flat, minimum 500 FCFA.
 */
export function serviceFee(price: number): number {
  return Math.max(500, Math.round(price * 0.08) + 500);
}

/**
 * Amount the seller earns after the service fee.
 */
export function sellerEarns(price: number): number {
  return Math.max(0, price - serviceFee(price));
}
