/**
 * Format currency to Vietnamese Dong (VND)
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted string like "100,000 VND"
 */
export function formatVND(
  amount: number | string,
  options?: {
    showSymbol?: boolean; // Show VND suffix (default: true)
    decimals?: number; // Number of decimal places (default: 0)
  }
): string {
  const { showSymbol = true, decimals = 0 } = options || {};

  // Convert to number if string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  // Handle invalid numbers
  if (isNaN(numAmount)) {
    return showSymbol ? "0 VND" : "0";
  }

  // Format with thousand separators and decimals
  const formatted = numAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${formatted} VND` : formatted;
}

/**
 * Format currency with short notation for large amounts
 * @param amount - The amount to format
 * @returns Formatted string like "1.2M VND" or "100K VND"
 */
export function formatVNDShort(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return "0 VND";

  if (numAmount >= 1000000000) {
    // Billions
    return `${(numAmount / 1000000000).toFixed(1)}B VND`;
  } else if (numAmount >= 1000000) {
    // Millions
    return `${(numAmount / 1000000).toFixed(1)}M VND`;
  } else if (numAmount >= 1000) {
    // Thousands
    return `${(numAmount / 1000).toFixed(0)}K VND`;
  }

  return `${numAmount.toLocaleString("en-US")} VND`;
}

/**
 * Parse VND string back to number
 * @param vndString - String like "100,000 VND" or "100000"
 * @returns Number value
 */
export function parseVND(vndString: string): number {
  // Remove "VND", commas, and spaces
  const cleaned = vndString.replace(/VND|,|\s/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
