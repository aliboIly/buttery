import { describe, expect, it } from "vitest";
import { AWAITING_PAYOUT, ORDERS, PAYOUTS, dayNumber } from "./data.ts";

describe("AWAITING_PAYOUT", () => {
  it("holds paid orders that no payout on its way already counts", () => {
    const sent = PAYOUTS.find((payout) => payout.status !== "scheduled");
    if (sent === undefined) throw new Error("No payout on its way.");
    const counted = ORDERS.filter((order) => {
      const age = dayNumber(sent.arrives) - dayNumber(order.placed);
      return (
        age > 2 &&
        age <= 9 &&
        order.status !== "refunded" &&
        order.status !== "unpaid"
      );
    });
    expect(counted.length).toBeGreaterThan(0);
    expect(AWAITING_PAYOUT.filter((order) => counted.includes(order))).toEqual(
      [],
    );
    expect(
      AWAITING_PAYOUT.every(
        (order) => order.status !== "refunded" && order.status !== "unpaid",
      ),
    ).toBe(true);
  });
});
