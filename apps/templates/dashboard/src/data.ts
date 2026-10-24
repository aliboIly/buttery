/** Where an order is: waiting for its payment, paid, on its way, or given back. */
export type OrderStatus = "unpaid" | "paid" | "shipped" | "refunded";

/** One order from the shop. */
export interface Order {
  readonly id: string;
  readonly customer: string;
  readonly item: string;
  /** What it cost, in dollars. */
  readonly amount: number;
  readonly status: OrderStatus;
  /** The day it was placed, as `YYYY-MM-DD`. */
  readonly placed: string;
}

/** Made-up orders, standing in for the app's own data. */
export const ORDERS: readonly Order[] = [
  {
    id: "1048",
    customer: "Ines Vale",
    item: "Linen tote",
    amount: 38,
    status: "paid",
    placed: "2026-10-21",
  },
  {
    id: "1047",
    customer: "Oskar Lind",
    item: "Stoneware mug, set of two",
    amount: 54,
    status: "unpaid",
    placed: "2026-10-21",
  },
  {
    id: "1046",
    customer: "Mira Okafor",
    item: "Walnut serving board",
    amount: 72,
    status: "shipped",
    placed: "2026-10-20",
  },
  {
    id: "1045",
    customer: "Teodor Brandt",
    item: "Beeswax candles, pack of six",
    amount: 24,
    status: "shipped",
    placed: "2026-10-19",
  },
  {
    id: "1044",
    customer: "Lena Duarte",
    item: "Linen tote",
    amount: 38,
    status: "refunded",
    placed: "2026-10-18",
  },
  {
    id: "1043",
    customer: "Kofi Mensah",
    item: "Stoneware mug, set of two",
    amount: 54,
    status: "shipped",
    placed: "2026-10-18",
  },
  {
    id: "1042",
    customer: "Ada Lindqvist",
    item: "Wool throw",
    amount: 120,
    status: "shipped",
    placed: "2026-10-17",
  },
  {
    id: "1041",
    customer: "Rui Tanaka",
    item: "Walnut serving board",
    amount: 72,
    status: "paid",
    placed: "2026-10-16",
  },
  {
    id: "1040",
    customer: "Hana Novak",
    item: "Beeswax candles, pack of six",
    amount: 24,
    status: "shipped",
    placed: "2026-10-15",
  },
  {
    id: "1039",
    customer: "Samir Haddad",
    item: "Wool throw",
    amount: 120,
    status: "shipped",
    placed: "2026-10-15",
  },
];

/** The kinds of things the shop sells. */
export type ProductCategory = "bags" | "kitchen" | "home";

/** One product in the shop. */
export interface Product {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly description: string;
  /** What it costs, in dollars. */
  readonly price: number;
  /** How many are left. */
  readonly stock: number;
}

/** Made-up products, the ones the orders are for. */
export const PRODUCTS: readonly Product[] = [
  {
    id: "linen-tote",
    name: "Linen tote",
    category: "bags",
    description: "Washed linen on a canvas base, with a pocket inside.",
    price: 38,
    stock: 14,
  },
  {
    id: "market-bag",
    name: "Market bag",
    category: "bags",
    description: "Cotton net that folds into its own pouch.",
    price: 22,
    stock: 3,
  },
  {
    id: "stoneware-mugs",
    name: "Stoneware mug, set of two",
    category: "kitchen",
    description: "Speckled glaze, twelve ounces, fine in the dishwasher.",
    price: 54,
    stock: 9,
  },
  {
    id: "walnut-board",
    name: "Walnut serving board",
    category: "kitchen",
    description: "One piece of oiled walnut with a hole to hang it by.",
    price: 72,
    stock: 6,
  },
  {
    id: "beeswax-candles",
    name: "Beeswax candles, pack of six",
    category: "home",
    description: "Dipped by hand, about eight hours each.",
    price: 24,
    stock: 31,
  },
  {
    id: "wool-throw",
    name: "Wool throw",
    category: "home",
    description: "Lambswool in a herringbone weave, 50 by 70 inches.",
    price: 120,
    stock: 2,
  },
];

/** The last seven days, oldest first, for the overview's charts. */
export const WEEK = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed"];

/** Sales each day, in dollars: this week and the week before. */
export const SALES = {
  now: [182, 240, 310, 198, 146, 238, 312],
  before: [160, 205, 288, 230, 150, 190, 260],
};

/** Orders each day: this week and the week before. */
export const ORDER_COUNTS = {
  now: [4, 5, 7, 4, 3, 5, 6],
  before: [3, 5, 6, 5, 3, 4, 5],
};

/** The sum of a list of numbers. */
export function total(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

/** The change from `before` to `now`, as a share: 0.12 for 12% up. */
export function change(now: number, before: number): number {
  return before === 0 ? 0 : (now - before) / before;
}

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** An amount in dollars, such as `$1,284.00`. */
export function money(value: number): string {
  return dollars.format(value);
}

const days = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** A `YYYY-MM-DD` day as people read it, such as `Oct 21`. */
export function shortDate(day: string): string {
  return days.format(new Date(`${day}T00:00:00Z`));
}
