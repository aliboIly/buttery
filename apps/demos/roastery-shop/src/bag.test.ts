import { describe, expect, it } from "vitest";
import {
  EMPTY_BAG,
  MOST_OF_ONE,
  addCoffee,
  bagCount,
  isBag,
  lineKey,
  removeLine,
  setPlan,
  setQuantity,
  shippingFor,
  subtotal,
  totalFor,
} from "./bag.ts";
import type { Bag, Plan } from "./bag.ts";

const GUJI = { coffee: "guji", size: "12oz", grind: "whole" } as const;
const HUILA = { coffee: "huila", size: "2lb", grind: "press" } as const;
const PLAN: Plan = {
  coffee: "choice",
  bags: 2,
  every: "two-weeks",
  grind: "whole",
  gift: null,
  recipient: null,
};

describe("the bag", () => {
  it("adds bags of the same coffee, size and grind to one line", () => {
    const bag = addCoffee(addCoffee(EMPTY_BAG, GUJI), GUJI);
    expect(bag.lines).toEqual([{ ...GUJI, quantity: 2 }]);
    expect(bagCount(bag)).toBe(2);
  });

  it("keeps a different size or grind on a line of its own", () => {
    const bag = addCoffee(addCoffee(EMPTY_BAG, GUJI), {
      ...GUJI,
      grind: "espresso",
    });
    expect(bag.lines).toHaveLength(2);
  });

  it("sets a line's bags from 1 to the most it holds", () => {
    const bag = addCoffee(EMPTY_BAG, GUJI);
    const key = lineKey(GUJI);
    expect(setQuantity(bag, key, 4).lines[0]?.quantity).toBe(4);
    expect(setQuantity(bag, key, 0).lines[0]?.quantity).toBe(1);
    expect(setQuantity(bag, key, 99).lines[0]?.quantity).toBe(MOST_OF_ONE);
    expect(addCoffee(bag, GUJI, 40).lines[0]?.quantity).toBe(MOST_OF_ONE);
  });

  it("removes a line and leaves the rest", () => {
    const bag = addCoffee(addCoffee(EMPTY_BAG, GUJI), HUILA);
    expect(removeLine(bag, lineKey(GUJI)).lines).toEqual([
      { ...HUILA, quantity: 1 },
    ]);
  });

  it("holds one subscription, the newest in place of the last", () => {
    const bag = setPlan(setPlan(EMPTY_BAG, PLAN), { ...PLAN, bags: 1 });
    expect(bag.plan?.bags).toBe(1);
    expect(bagCount(bag)).toBe(1);
    expect(setPlan(bag, null).plan).toBeNull();
  });
});

describe("what the bag costs", () => {
  it("adds up its lines in cents", () => {
    const bag = addCoffee(addCoffee(addCoffee(EMPTY_BAG, GUJI), GUJI), HUILA);
    expect(subtotal(bag)).toBe(1900 * 2 + 4100);
  });

  it("charges shipping until the order reaches $40", () => {
    const small = addCoffee(EMPTY_BAG, GUJI);
    expect(shippingFor(small, "standard")).toBe(600);
    expect(totalFor(small, "standard")).toBe(2500);
    const big = addCoffee(small, HUILA);
    expect(shippingFor(big, "standard")).toBe(0);
    expect(totalFor(big, "next-day")).toBe(6000 + 1400);
  });

  it("counts a subscription's first delivery, or a gift's every delivery, and ships it free", () => {
    const bag = setPlan(addCoffee(EMPTY_BAG, GUJI), PLAN);
    expect(subtotal(bag)).toBe(1900 + 3240);
    expect(shippingFor(bag, "standard")).toBe(0);
    const gift = setPlan(EMPTY_BAG, {
      ...PLAN,
      bags: 1,
      gift: 3,
      recipient: { name: "Sam Okafor", email: "sam@example.com" },
    });
    expect(subtotal(gift)).toBe(1620 * 3);
  });
});

describe("isBag", () => {
  it("takes a bag it saved", () => {
    const bag: Bag = setPlan(addCoffee(EMPTY_BAG, HUILA), PLAN);
    expect(isBag(JSON.parse(JSON.stringify(bag)))).toBe(true);
    expect(isBag({ lines: [], plan: { ...PLAN, every: "four-weeks" } })).toBe(
      true,
    );
  });

  it("turns down what it can't show, so the bag starts empty", () => {
    expect(isBag(null)).toBe(false);
    expect(isBag({ lines: [{ ...GUJI, quantity: 0 }], plan: null })).toBe(
      false,
    );
    expect(isBag({ lines: [{ ...GUJI, coffee: "decaf", quantity: 1 }] })).toBe(
      false,
    );
    expect(isBag({ lines: [], plan: { ...PLAN, every: "month" } })).toBe(false);
    expect(isBag({ lines: [], plan: { ...PLAN, recipient: "Sam" } })).toBe(
      false,
    );
  });
});
