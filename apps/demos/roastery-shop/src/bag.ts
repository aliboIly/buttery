import { useStoredState } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import { isCoffeeId, isGrindId, isSizeId } from "./data.ts";
import type { CoffeeId, GrindId, SizeId } from "./data.ts";
import { bagPrice, planPrice, shippingCost } from "./pricing.ts";
import type {
  BagsPerDelivery,
  Delivery,
  Frequency,
  GiftLength,
  PlanCoffee,
} from "./pricing.ts";
import { STORAGE_PREFIX } from "./storage.ts";

/** The most bags of one coffee, size and grind a bag holds. */
export const MOST_OF_ONE = 12;

/** Bags of one coffee in one size and grind. */
export interface CoffeeLine {
  readonly coffee: CoffeeId;
  readonly size: SizeId;
  readonly grind: GrindId;
  readonly quantity: number;
}

/** A subscription waiting in the bag, which starts when the order is placed. */
export interface Plan {
  readonly coffee: PlanCoffee;
  readonly bags: BagsPerDelivery;
  readonly every: Frequency;
  readonly grind: GrindId;
  /** How many deliveries it pays for up front as a gift, or `null` for an ongoing one. */
  readonly gift: GiftLength | null;
}

/** What someone is about to order: bags of coffee, and at most one subscription. */
export interface Bag {
  readonly lines: readonly CoffeeLine[];
  readonly plan: Plan | null;
}

export const EMPTY_BAG: Bag = { lines: [], plan: null };

/** What tells two lines apart: the coffee, its size and its grind. */
export function lineKey(line: Omit<CoffeeLine, "quantity">): string {
  return `${line.coffee}:${line.size}:${line.grind}`;
}

function clamp(quantity: number): number {
  return Math.min(MOST_OF_ONE, Math.max(1, Math.round(quantity)));
}

/** Adds bags to the bag, onto the line of the same coffee, size and grind when there is one. */
export function addCoffee(
  bag: Bag,
  choice: Omit<CoffeeLine, "quantity">,
  quantity = 1,
): Bag {
  const key = lineKey(choice);
  const existing = bag.lines.find((line) => lineKey(line) === key);
  if (existing === undefined)
    return {
      ...bag,
      lines: [...bag.lines, { ...choice, quantity: clamp(quantity) }],
    };
  return setQuantity(bag, key, existing.quantity + quantity);
}

/** Sets a line's number of bags, from 1 to `MOST_OF_ONE`. */
export function setQuantity(bag: Bag, key: string, quantity: number): Bag {
  return {
    ...bag,
    lines: bag.lines.map((line) =>
      lineKey(line) === key ? { ...line, quantity: clamp(quantity) } : line,
    ),
  };
}

export function removeLine(bag: Bag, key: string): Bag {
  return { ...bag, lines: bag.lines.filter((line) => lineKey(line) !== key) };
}

/** Puts a subscription in the bag, in place of the one already there. */
export function setPlan(bag: Bag, plan: Plan | null): Bag {
  return { ...bag, plan };
}

/** How many bags of coffee the bag holds, counting a subscription's first delivery. */
export function bagCount(bag: Bag): number {
  return (
    bag.lines.reduce((sum, line) => sum + line.quantity, 0) +
    (bag.plan?.bags ?? 0)
  );
}

export function lineTotal(line: CoffeeLine): number {
  return bagPrice(line.coffee, line.size) * line.quantity;
}

/** What's due today for what's in the bag, before shipping, in cents. */
export function subtotal(bag: Bag): number {
  const lines = bag.lines.reduce((sum, line) => sum + lineTotal(line), 0);
  if (bag.plan === null) return lines;
  return (
    lines + planPrice(bag.plan.coffee, bag.plan.bags, bag.plan.gift).dueToday
  );
}

export function shippingFor(bag: Bag, delivery: Delivery): number {
  return shippingCost(subtotal(bag), delivery, bag.plan !== null);
}

export function totalFor(bag: Bag, delivery: Delivery): number {
  return subtotal(bag) + shippingFor(bag, delivery);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLine(value: unknown): value is CoffeeLine {
  return (
    isRecord(value) &&
    isCoffeeId(value["coffee"]) &&
    isSizeId(value["size"]) &&
    isGrindId(value["grind"]) &&
    typeof value["quantity"] === "number" &&
    Number.isInteger(value["quantity"]) &&
    value["quantity"] >= 1 &&
    value["quantity"] <= MOST_OF_ONE
  );
}

function isPlan(value: unknown): value is Plan {
  return (
    isRecord(value) &&
    (value["coffee"] === "choice" || isCoffeeId(value["coffee"])) &&
    (value["bags"] === 1 || value["bags"] === 2 || value["bags"] === 3) &&
    (value["every"] === "week" || value["every"] === "two-weeks") &&
    isGrindId(value["grind"]) &&
    (value["gift"] === null ||
      value["gift"] === 3 ||
      value["gift"] === 6 ||
      value["gift"] === 12)
  );
}

/** Whether a stored value is a bag the shop can show, so an old or edited one starts the bag empty. */
export function isBag(value: unknown): value is Bag {
  return (
    isRecord(value) &&
    Array.isArray(value["lines"]) &&
    value["lines"].every(isLine) &&
    (value["plan"] === null || isPlan(value["plan"]))
  );
}

/** The bag, kept in `localStorage` across visits. */
export function useBag(): readonly [Bag, StoredStateSetter<Bag>] {
  return useStoredState(`${STORAGE_PREFIX}:bag`, EMPTY_BAG, isBag);
}
