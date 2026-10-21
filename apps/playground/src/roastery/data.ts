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

function daysBefore(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/** The demo's today: a fixed Wednesday, so dates and charts never drift. */
export const TODAY = new Date(2026, 9, 21, 16, 30);

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

function slug(text: string): string {
  return text
    .toLowerCase()
    .replaceAll(/[^a-z]+/g, ".")
    .replaceAll(/^\.|\.$/g, "");
}

export const CUSTOMERS: readonly Customer[] = [
  ...Array.from({ length: 52 }, (): Customer => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    return {
      id: idFor("cus"),
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}@example.com`,
      kind: "retail",
      city: pick(CITIES),
      since: daysBefore(TODAY, between(20, 900)),
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

/** Fifty-six days of orders, busier on weekends and growing a little week over week. */
export const ORDERS: readonly Order[] = Array.from({ length: 56 }, (_, age) => {
  const placedDay = daysBefore(TODAY, age);
  const weekend = placedDay.getDay() === 0 || placedDay.getDay() === 6;
  const count = Math.round((weekend ? 6 : 4) * (1 - age / 120) + random() * 2);
  return Array.from({ length: count }, (): Order => {
    const wholesale = random() < 0.16;
    const customer = pick(wholesale ? WHOLESALE : RETAIL);
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
      channel: wholesale
        ? "wholesale"
        : random() < 0.3
          ? "subscription"
          : "web",
    };
  });
})
  .flat()
  .sort((a, b) => b.placed.getTime() - a.placed.getTime());

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
    return {
      id: idFor("sub"),
      customerId: pick(RETAIL).id,
      coffeeId: pick(COFFEES).id,
      every: random() < 0.6 ? "two weeks" : "week",
      bags: between(1, 2),
      status,
      next: status === "active" ? next : null,
      started: daysBefore(TODAY, between(10, 500)),
    };
  },
);

export interface Payout {
  readonly id: string;
  readonly arrives: Date;
  readonly amount: number;
  readonly status: "paid" | "in transit" | "scheduled";
}

/** Fridays' payouts: the week's paid sales less 3%, the next one scheduled. */
export const PAYOUTS: readonly Payout[] = Array.from(
  { length: 8 },
  (_, week): Payout => {
    const arrives = new Date(TODAY);
    arrives.setDate(TODAY.getDate() + 2 - week * 7);
    const weekOrders = ORDERS.filter((order) => {
      const age = (arrives.getTime() - order.placed.getTime()) / 86_400_000;
      return (
        age > 2 &&
        age <= 9 &&
        order.status !== "refunded" &&
        order.status !== "unpaid"
      );
    });
    const total = weekOrders.reduce((sum, order) => sum + order.amount, 0);
    return {
      id: idFor("po"),
      arrives,
      amount: Math.round(total * 97) / 100,
      status: week === 0 ? "scheduled" : week === 1 ? "in transit" : "paid",
    };
  },
);

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

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** One number per day for `days` days ending `endAge` days ago, oldest first. */
export function daily(
  measure: (orders: readonly Order[]) => number,
  days: number,
  endAge = 0,
): number[] {
  return Array.from({ length: days }, (_, index) => {
    const day = daysBefore(TODAY, endAge + days - 1 - index);
    return measure(ORDERS.filter((order) => sameDay(order.placed, day)));
  });
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

export function grossVolume(orders: readonly Order[]): number {
  return sum(
    orders
      .filter((order) => order.status !== "refunded")
      .map((order) => order.amount),
  );
}

export function bagCount(orders: readonly Order[]): number {
  return sum(orders.map((order) => order.bags));
}
