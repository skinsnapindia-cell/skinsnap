/** Format a rupee amount, e.g. formatINR(50) -> "₹50". */
export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * Format a possibly-fractional per-unit price: shows 2 decimals only when the
 * amount isn't a whole rupee, e.g. formatUnitINR(283) -> "₹283",
 * formatUnitINR(324.5) -> "₹324.50".
 */
export function formatUnitINR(n: number): string {
  const hasFraction = Math.round(n * 100) % 100 !== 0;
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}
