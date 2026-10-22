import { SIZES, coffeeOf } from "./data.ts";
import type { CoffeeId, SizeId } from "./data.ts";
import { dollars } from "./format.ts";

/** Standard shipping is free once an order reaches this much, in cents. */
export const FREE_SHIPPING_FROM = 4000;
export const STANDARD_SHIPPING = 600;
export const NEXT_DAY_SHIPPING = 1400;

/** What every bag in a subscription is taken off, as a fraction. */
export const SUBSCRIPTION_DISCOUNT = 0.1;

/** What a 12 oz bag of roaster's choice costs before the subscription discount, in cents. */
export const ROASTERS_CHOICE_PRICE = 1800;

/** What each size costs against a 12 oz bag: bigger bags cost less per ounce. */
const SIZE_FACTORS: Readonly<Record<SizeId, number>> = {
  "12oz": 1,
  "2lb": 2.4,
  "5lb": 5.4,
};

/** What one bag of `coffee` in `size` costs, in cents, rounded to whole dollars. */
export function bagPrice(coffee: CoffeeId, size: SizeId): number {
  return Math.round(coffeeOf(coffee).price * SIZE_FACTORS[size]) * 100;
}

/** What each size of a coffee costs, as a field's hint says it, such as "12 oz $19 · 2 lb $46 · 5 lb $103". */
export function sizePrices(coffee: CoffeeId): string {
  return SIZES.map(
    (size) => `${size.label} ${dollars(bagPrice(coffee, size.id))}`,
  ).join(" · ");
}

/** How often a subscription delivers. */
export type Frequency = "week" | "two-weeks";

/** How many bags each delivery holds. */
export type BagsPerDelivery = 1 | 2 | 3;

/** How many deliveries a gift subscription pays for up front. */
export type GiftLength = 3 | 6 | 12;

/** A subscription's coffee: one of the coffees, or a different one each time. */
export type PlanCoffee = CoffeeId | "choice";

/** What a subscription costs: per delivery, what the discount saves each time, and what's due today. */
export interface PlanPrice {
  readonly perDelivery: number;
  readonly saving: number;
  readonly dueToday: number;
}

/** The full price of one 12 oz bag of a subscription's coffee, before the discount, in cents. */
export function planBagPrice(coffee: PlanCoffee): number {
  return coffee === "choice" ? ROASTERS_CHOICE_PRICE : bagPrice(coffee, "12oz");
}

/** What a subscription of `bags` 12 oz bags of `coffee` costs, paid per delivery or, as a gift, all at once. */
export function planPrice(
  coffee: PlanCoffee,
  bags: BagsPerDelivery,
  gift: GiftLength | null,
): PlanPrice {
  const full = planBagPrice(coffee) * bags;
  const perDelivery = Math.round(full * (1 - SUBSCRIPTION_DISCOUNT));
  return {
    perDelivery,
    saving: full - perDelivery,
    dueToday: perDelivery * (gift ?? 1),
  };
}

/** How an order is delivered. */
export type Delivery = "standard" | "next-day";

/** What shipping costs on an order of `subtotal` cents, which ships free with a subscription in it. */
export function shippingCost(
  subtotal: number,
  delivery: Delivery,
  hasPlan: boolean,
): number {
  if (delivery === "next-day") return NEXT_DAY_SHIPPING;
  return hasPlan || subtotal >= FREE_SHIPPING_FROM ? 0 : STANDARD_SHIPPING;
}

/** How much more an order needs before standard shipping is free, in cents: 0 once it is. */
export function freeShippingLeft(subtotal: number, hasPlan: boolean): number {
  return hasPlan ? 0 : Math.max(0, FREE_SHIPPING_FROM - subtotal);
}
