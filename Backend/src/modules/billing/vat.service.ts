export const VAT_RATE = 0.15;

/**
 * Calculates VAT (15%) and subtotal from a total gross amount in cents.
 */
export function calculateVATFromGross(total: number) {
  const subtotal = Math.round(total / (1 + VAT_RATE));
  const vat = total - subtotal;
  return {
    subtotal,
    vat,
    total,
  };
}
