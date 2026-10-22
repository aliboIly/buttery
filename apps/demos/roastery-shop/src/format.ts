const cents = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const wholeDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** An amount in cents as dollars and cents, such as "$19.00". */
export function money(amount: number): string {
  return cents.format(amount / 100);
}

/** An amount in cents as whole dollars, such as "$19". */
export function dollars(amount: number): string {
  return wholeDollars.format(amount / 100);
}

/** "1 bag" or "3 bags". */
export function bags(count: number): string {
  return `${String(count)} ${count === 1 ? "bag" : "bags"}`;
}
