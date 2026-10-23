/** A small random number source with a fixed seed, so the demo shows the same shop on every load. */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = state;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

const random = seeded(20261021);

function between(low: number, high: number): number {
  return low + Math.floor(random() * (high - low + 1));
}

function pick<Item>(items: readonly Item[]): Item {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) throw new Error("pick needs at least one item");
  return item;
}

const ID_LETTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function idFor(prefix: string): string {
  let code = "";
  for (let index = 0; index < 8; index += 1)
    code += ID_LETTERS.charAt(Math.floor(random() * ID_LETTERS.length));
  return `${prefix}_${code}`;
}

/** A calendar day as a whole number, the same in every time zone, for counting the days between dates. */
export function dayNumber(date: Date): number {
  return Math.round(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

/** The same time `days` calendar days earlier, however the clocks change in between. */
export function daysBefore(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/** The demo's today: a fixed Wednesday, so dates and charts never drift. */
export const TODAY = new Date(2026, 9, 21, 16, 30);

/** How many days of orders the shop has: two years, enough for a year against the year before. */
export const HISTORY = 730;

export interface Coffee {
  readonly id: string;
  readonly name: string;
  readonly origin: string;
  readonly process: string;
  readonly roast: "Light" | "Medium" | "Dark";
  readonly price: number;
}

export const COFFEES: readonly Coffee[] = [
  {
    id: "guji",
    name: "Guji",
    origin: "Ethiopia",
    process: "Washed",
    roast: "Light",
    price: 19,
  },
  {
    id: "huila",
    name: "Huila",
    origin: "Colombia",
    process: "Washed",
    roast: "Medium",
    price: 17,
  },
  {
    id: "cerrado",
    name: "Cerrado",
    origin: "Brazil",
    process: "Natural",
    roast: "Medium",
    price: 15,
  },
  {
    id: "nyeri",
    name: "Nyeri",
    origin: "Kenya",
    process: "Washed",
    roast: "Light",
    price: 21,
  },
  {
    id: "huehue",
    name: "Huehuetenango",
    origin: "Guatemala",
    process: "Washed",
    roast: "Medium",
    price: 18,
  },
  {
    id: "house",
    name: "Halfmoon House",
    origin: "Blend",
    process: "Mixed",
    roast: "Dark",
    price: 14,
  },
];

export type CustomerKind = "retail" | "wholesale";

export interface Customer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly kind: CustomerKind;
  readonly city: string;
  readonly since: Date;
}

const FIRST_NAMES = [
  "Rosa",
  "Theo",
  "Imani",
  "Felix",
  "Noor",
  "Hugo",
  "Amara",
  "Jonah",
  "Priya",
  "Mateo",
  "Lena",
  "Omar",
  "Sadie",
  "Kenji",
  "Ines",
  "Rafael",
  "Maya",
  "Tobias",
  "Zara",
  "Elliot",
  "Hana",
  "Luca",
  "Wren",
  "Diego",
  "Ada",
  "Sami",
  "Clara",
  "Ezra",
  "Mina",
  "Owen",
];
const LAST_NAMES = [
  "Delgado",
  "Okafor",
  "Lindqvist",
  "Moreau",
  "Haddad",
  "Novak",
  "Tanaka",
  "Silva",
  "Brennan",
  "Varga",
  "Achebe",
  "Kowalski",
  "Reyes",
  "Holm",
  "Farouk",
  "Castillo",
  "Weber",
  "Nakamura",
  "Duarte",
  "Quinn",
];
const CAFES = [
  "Blue Door Café",
  "Little Fern Coffee",
  "The Reading Room",
  "Morning Tide Café",
  "Juniper & Rye",
  "Copper Kettle Diner",
  "Northgate Library Café",
  "Corner Bakery Co-op",
];
const CITIES = [
  "Portland",
  "Seattle",
  "Eugene",
  "Tacoma",
  "Boise",
  "Bend",
  "Spokane",
  "Salem",
];

/** Letters for an email address: accents dropped, so "Café" becomes "cafe". */
function slug(text: string): string {
  return text
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll(/[^a-z]+/g, ".")
    .replaceAll(/^\.|\.$/g, "");
}

const RETAIL_CUSTOMERS = 400;
const taken = new Set<string>();

function uniqueName(): readonly [string, string] {
  for (;;) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    if (taken.has(`${first} ${last}`)) continue;
    taken.add(`${first} ${last}`);
    return [first, last];
  }
}

export const CUSTOMERS: readonly Customer[] = [
  ...Array.from({ length: RETAIL_CUSTOMERS }, (): Customer => {
    const [first, last] = uniqueName();
    return {
      id: idFor("cus"),
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}@example.com`,
      kind: "retail",
      city: pick(CITIES),
      since: daysBefore(TODAY, between(2, HISTORY + 30)),
    };
  }),
  ...CAFES.map((cafe): Customer => ({
    id: idFor("cus"),
    name: cafe,
    email: `orders@${slug(cafe).replaceAll(".", "")}.example.com`,
    kind: "wholesale",
    city: pick(CITIES),
    since: daysBefore(TODAY, between(120, 1400)),
  })),
];

export type OrderStatus =
  "unpaid" | "paid" | "roasting" | "shipped" | "refunded";

export interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly coffeeId: string;
  readonly placed: Date;
  readonly bags: number;
  readonly amount: number;
  readonly status: OrderStatus;
  readonly channel: "web" | "wholesale" | "subscription";
}

function statusFor(age: number): OrderStatus {
  if (random() < 0.04) return "refunded";
  if (age === 0) return random() < 0.4 ? "unpaid" : "paid";
  if (age <= 2) return random() < 0.15 ? "unpaid" : "roasting";
  if (age <= 4) return random() < 0.5 ? "roasting" : "shipped";
  return "shipped";
}

const RETAIL = CUSTOMERS.filter((customer) => customer.kind === "retail");
const WHOLESALE = CUSTOMERS.filter((customer) => customer.kind === "wholesale");

/** The customers who had joined by `day`, so no one orders before they signed up. */
function joinedBy(customers: readonly Customer[], day: Date): Customer[] {
  const number = dayNumber(day);
  return customers.filter((customer) => dayNumber(customer.since) <= number);
}

function orderOn(
  placedDay: Date,
  age: number,
  customer: Customer,
  wholesale: boolean,
): Order {
  const coffee = pick(COFFEES);
  const bags = wholesale ? between(6, 18) : between(1, 3);
  const placed = new Date(placedDay);
  placed.setHours(between(7, 21), between(0, 59));
  if (age === 0 && placed > TODAY) placed.setHours(between(7, 15));
  return {
    id: idFor("ord"),
    customerId: customer.id,
    coffeeId: coffee.id,
    placed,
    bags,
    amount: bags * coffee.price + (wholesale ? 0 : 6),
    status: statusFor(age),
    channel: wholesale ? "wholesale" : random() < 0.3 ? "subscription" : "web",
  };
}

/** Busier in the run-up to the holidays, the way a roaster's year goes. */
const SEASON = [1, 0.95, 1, 1, 1, 0.95, 0.9, 0.9, 1, 1.05, 1.15, 1.35];

/**
 * Two years of orders, newest first: busier on weekends and before the holidays, and growing over time,
 * each from a customer who had joined by then.
 */
export const ORDERS: readonly Order[] = Array.from(
  { length: HISTORY },
  (_, index) => {
    const age = HISTORY - 1 - index;
    const placedDay = daysBefore(TODAY, age);
    const weekend = placedDay.getDay() === 0 || placedDay.getDay() === 6;
    const growth = 0.6 + 0.4 * (1 - age / HISTORY);
    const season = SEASON[placedDay.getMonth()] ?? 1;
    const count = Math.round(
      (weekend ? 6 : 4) * growth * season + random() * 2,
    );
    const retail = joinedBy(RETAIL, placedDay);
    const wholesale = joinedBy(WHOLESALE, placedDay);
    return Array.from({ length: count }, (): Order | undefined => {
      const toCafe = wholesale.length > 0 && random() < 0.16;
      const buyers = toCafe ? wholesale : retail;
      if (buyers.length === 0) return undefined;
      return orderOn(placedDay, age, pick(buyers), toCafe);
    }).filter((order) => order !== undefined);
  },
)
  .flat()
  .sort((a, b) => b.placed.getTime() - a.placed.getTime());

const ORDERS_BY_DAY = new Map<number, Order[]>();
const ORDERS_BY_CUSTOMER = new Map<string, Order[]>();
for (const order of ORDERS) {
  const day = dayNumber(order.placed);
  ORDERS_BY_DAY.set(day, [...(ORDERS_BY_DAY.get(day) ?? []), order]);
  ORDERS_BY_CUSTOMER.set(order.customerId, [
    ...(ORDERS_BY_CUSTOMER.get(order.customerId) ?? []),
    order,
  ]);
}

/** The orders placed on `day`'s calendar day. */
export function ordersOn(day: Date): readonly Order[] {
  return ORDERS_BY_DAY.get(dayNumber(day)) ?? [];
}

/** A customer's orders, newest first. */
export function ordersOf(customerId: string): readonly Order[] {
  return ORDERS_BY_CUSTOMER.get(customerId) ?? [];
}

export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface Subscription {
  readonly id: string;
  readonly customerId: string;
  readonly coffeeId: string;
  readonly every: "week" | "two weeks";
  readonly bags: number;
  readonly status: SubscriptionStatus;
  readonly next: Date | null;
  readonly started: Date;
}

export const SUBSCRIPTIONS: readonly Subscription[] = Array.from(
  { length: 46 },
  (): Subscription => {
    const roll = random();
    const status: SubscriptionStatus =
      roll < 0.74 ? "active" : roll < 0.88 ? "paused" : "cancelled";
    const next = new Date(TODAY);
    next.setDate(TODAY.getDate() + between(1, 14));
    const customer = pick(RETAIL);
    const joined = dayNumber(TODAY) - dayNumber(customer.since);
    return {
      id: idFor("sub"),
      customerId: customer.id,
      coffeeId: pick(COFFEES).id,
      every: random() < 0.6 ? "two weeks" : "week",
      bags: between(1, 2),
      status,
      next: status === "active" ? next : null,
      started: daysBefore(TODAY, between(0, Math.max(0, joined))),
    };
  },
);

export interface Payout {
  readonly id: string;
  readonly arrives: Date;
  readonly amount: number;
  readonly status: "paid" | "in transit" | "scheduled";
}

/** Days a payout spends on its way to the bank before it arrives. */
const TRANSIT = 2;

/**
 * Fridays' payouts, newest first: the paid sales of the week before each, less 3%. One that arrives in
 * the next two days is in transit, a later one is scheduled, and an earlier one is paid.
 */
export const PAYOUTS: readonly Payout[] = Array.from(
  { length: 9 },
  (_, week): Payout => {
    const arrives = new Date(TODAY);
    arrives.setDate(TODAY.getDate() + 9 - week * 7);
    const due = dayNumber(arrives);
    const weekOrders = ORDERS.filter((order) => {
      const age = due - dayNumber(order.placed);
      return (
        age > TRANSIT &&
        age <= TRANSIT + 7 &&
        order.status !== "refunded" &&
        order.status !== "unpaid"
      );
    });
    const total = weekOrders.reduce((sum, order) => sum + order.amount, 0);
    const ahead = due - dayNumber(TODAY);
    return {
      id: idFor("po"),
      arrives,
      amount: Math.round(total * 97) / 100,
      status: ahead > TRANSIT ? "scheduled" : ahead > 0 ? "in transit" : "paid",
    };
  },
);

/** The payout that arrives next. */
export const NEXT_PAYOUT: Payout | undefined = PAYOUTS.findLast(
  (payout) => dayNumber(payout.arrives) > dayNumber(TODAY),
);

/**
 * Paid orders no payout has taken yet: those placed on or after the day the newest payout that's paid or
 * in transit stopped counting, so none of them is in a payout already on its way.
 */
export const AWAITING_PAYOUT: readonly Order[] = ((): readonly Order[] => {
  const sent = PAYOUTS.find((payout) => payout.status !== "scheduled");
  const from =
    sent === undefined
      ? Number.NEGATIVE_INFINITY
      : dayNumber(sent.arrives) - TRANSIT;
  return ORDERS.filter(
    (order) =>
      order.status !== "refunded" &&
      order.status !== "unpaid" &&
      dayNumber(order.placed) >= from,
  );
})();

export interface StockLot {
  readonly id: string;
  readonly coffeeId: string;
  readonly warehouse: "Harbor Street" | "Mill Lane";
  readonly kilograms: number;
  readonly arrived: Date;
}

export const STOCK: readonly StockLot[] = [
  {
    id: "lot-guji",
    coffeeId: "guji",
    warehouse: "Harbor Street",
    kilograms: 640,
    arrived: new Date(2026, 9, 3),
  },
  {
    id: "lot-huila",
    coffeeId: "huila",
    warehouse: "Harbor Street",
    kilograms: 410,
    arrived: new Date(2026, 8, 19),
  },
  {
    id: "lot-huehue",
    coffeeId: "huehue",
    warehouse: "Harbor Street",
    kilograms: 275,
    arrived: new Date(2026, 8, 2),
  },
  {
    id: "lot-cerrado",
    coffeeId: "cerrado",
    warehouse: "Mill Lane",
    kilograms: 1090,
    arrived: new Date(2026, 7, 28),
  },
  {
    id: "lot-nyeri",
    coffeeId: "nyeri",
    warehouse: "Mill Lane",
    kilograms: 180,
    arrived: new Date(2026, 6, 30),
  },
];

export function coffeeOf(id: string): Coffee {
  const coffee = COFFEES.find((candidate) => candidate.id === id);
  if (coffee === undefined) throw new Error(`No coffee ${id}`);
  return coffee;
}

export function customerOf(id: string): Customer | undefined {
  return CUSTOMERS.find((candidate) => candidate.id === id);
}

/** One number per day for `days` days ending `endAge` days ago, oldest first. */
export function daily(
  measure: (orders: readonly Order[]) => number,
  days: number,
  endAge = 0,
): number[] {
  return Array.from({ length: days }, (_, index) =>
    measure(ordersOn(daysBefore(TODAY, endAge + days - 1 - index))),
  );
}

/**
 * One number per calendar month for the `months` whole months before this one, oldest first, with each
 * month's short name.
 */
export function monthly(
  measure: (orders: readonly Order[]) => number,
  months: number,
): { readonly labels: string[]; readonly values: number[] } {
  const format = new Intl.DateTimeFormat("en-US", { month: "short" });
  const starts = Array.from(
    { length: months },
    (_, index) =>
      new Date(TODAY.getFullYear(), TODAY.getMonth() - months + index, 1),
  );
  return {
    labels: starts.map((start) => format.format(start)),
    values: starts.map((start) => {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return measure(
        ORDERS.filter((order) => order.placed >= start && order.placed < end),
      );
    }),
  };
}

/** The labels for those days, such as "Oct 8". */
export function dayLabels(days: number, endAge = 0): string[] {
  const format = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return Array.from({ length: days }, (_, index) =>
    format.format(daysBefore(TODAY, endAge + days - 1 - index)),
  );
}

export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function salesTotal(orders: readonly Order[]): number {
  return sum(
    orders
      .filter((order) => order.status !== "refunded")
      .map((order) => order.amount),
  );
}

export function bagCount(orders: readonly Order[]): number {
  return sum(orders.map((order) => order.bags));
}
