/** Indonesian decimal comma with one decimal: 4 -> "4,0". */
export function formatAverage(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

/** Whole numbers stay whole ("1"), others get one decimal ("0,5"). */
export function formatPoints(value: number): string {
  return Number.isInteger(value) ? String(value) : formatAverage(value);
}
