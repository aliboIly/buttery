import { describe, expect, it } from "vitest";
import {
  FREE_SHIPPING_FROM,
  NEXT_DAY_SHIPPING,
  STANDARD_SHIPPING,
  bagPrice,
  freeShippingLeft,
  planBagPrice,
  planPrice,
  shippingCost,
  sizePrices,
} from "./pricing.ts";

describe("bagPrice", () => {
  it("charges a 12 oz bag its listed price, in cents", () => {
    expect(bagPrice("guji", "12oz")).toBe(1900);
    expect(bagPrice("house", "12oz")).toBe(1400);
  });

  it("charges less per ounce for a bigger bag, rounded to whole dollars", () => {
    expect(bagPrice("guji", "2lb")).toBe(4600);
    expect(bagPrice("guji", "5lb")).toBe(10300);
    expect(bagPrice("nyeri", "2lb")).toBe(5000);
    expect(bagPrice("house", "5lb")).toBe(7600);
  });
});

describe("sizePrices", () => {
  it("lists every size with its price", () => {
    expect(sizePrices("guji")).toBe("12 oz $19 · 2 lb $46 · 5 lb $103");
  });
});

describe("planPrice", () => {
  it("takes 10% off every bag, delivery by delivery", () => {
    expect(planPrice("huila", 2, null)).toEqual({
      perDelivery: 3060,
      saving: 340,
      dueToday: 3060,
    });
  });

  it("prices roaster's choice at its own rate", () => {
    expect(planBagPrice("choice")).toBe(1800);
    expect(planPrice("choice", 1, null).perDelivery).toBe(1620);
  });

  it("asks for every delivery of a gift up front", () => {
    expect(planPrice("guji", 1, 6)).toEqual({
      perDelivery: 1710,
      saving: 190,
      dueToday: 10260,
    });
  });

  it("rounds each delivery to the cent", () => {
    expect(planPrice("cerrado", 3, null).perDelivery).toBe(4050);
    expect(planPrice("huehue", 3, 12).dueToday).toBe(4860 * 12);
  });
});

describe("shipping", () => {
  it("charges standard shipping under the free-shipping line and nothing from it", () => {
    expect(shippingCost(FREE_SHIPPING_FROM - 1, "standard", false)).toBe(
      STANDARD_SHIPPING,
    );
    expect(shippingCost(FREE_SHIPPING_FROM, "standard", false)).toBe(0);
  });

  it("ships an order with a subscription in it free, whatever it comes to", () => {
    expect(shippingCost(1620, "standard", true)).toBe(0);
    expect(freeShippingLeft(1620, true)).toBe(0);
  });

  it("charges next-day delivery whatever the order comes to", () => {
    expect(shippingCost(9000, "next-day", false)).toBe(NEXT_DAY_SHIPPING);
    expect(shippingCost(1000, "next-day", true)).toBe(NEXT_DAY_SHIPPING);
  });

  it("says how much more an order needs for free shipping", () => {
    expect(freeShippingLeft(2800, false)).toBe(1200);
    expect(freeShippingLeft(4500, false)).toBe(0);
  });
});
