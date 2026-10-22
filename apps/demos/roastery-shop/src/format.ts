const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** An amount in cents as dollars, such as "$19.00". */
export function money(cents: number): string {
  return dollars.format(cents / 100);
}

/** "1 bag" or "3 bags". */
export function bags(count: number): string {
  return `${String(count)} ${count === 1 ? "bag" : "bags"}`;
}
