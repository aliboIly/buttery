import type { Plan } from "./bag.ts";
import { COFFEES, coffeeOf } from "./data.ts";
import { bags } from "./format.ts";
import type {
  BagsPerDelivery,
  Frequency,
  GiftLength,
  PlanCoffee,
} from "./pricing.ts";

export const FREQUENCIES: readonly {
  readonly value: Frequency;
  readonly label: string;
}[] = [
  { value: "week", label: "Every week" },
  { value: "two-weeks", label: "Every 2 weeks" },
];

export const BAG_COUNTS: readonly BagsPerDelivery[] = [1, 2, 3];

export const GIFT_LENGTHS: readonly GiftLength[] = [3, 6, 12];

export const PLAN_COFFEES: readonly {
  readonly value: PlanCoffee;
  readonly label: string;
}[] = [
  { value: "choice", label: "Roaster's choice" },
  ...COFFEES.map((coffee) => ({ value: coffee.id, label: coffee.name })),
];

export function planCoffeeName(coffee: PlanCoffee): string {
  return coffee === "choice" ? "Roaster's choice" : coffeeOf(coffee).name;
}

/** A subscription's name, such as "Huila subscription" or "Huila, a gift for Sam". */
export function planName(plan: Plan): string {
  const coffee = planCoffeeName(plan.coffee);
  return plan.recipient === null
    ? `${coffee} subscription`
    : `${coffee}, a gift for ${firstName(plan.recipient.name)}`;
}

/** The first word of a name, such as "Sam" for "Sam Okafor". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** How much a subscription sends and how often, such as "2 bags every 2 weeks". */
export function planSchedule(plan: Pick<Plan, "bags" | "every">): string {
  return `${bags(plan.bags)} ${plan.every === "week" ? "every week" : "every 2 weeks"}`;
}

/** The bag count a segmented control's value names. */
export function bagCountFrom(value: string): BagsPerDelivery | undefined {
  return BAG_COUNTS.find((count) => String(count) === value);
}

/** The gift length a segmented control's value names. */
export function giftLengthFrom(value: string): GiftLength | undefined {
  return GIFT_LENGTHS.find((length) => String(length) === value);
}
