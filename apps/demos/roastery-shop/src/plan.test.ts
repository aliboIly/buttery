import { describe, expect, it } from "vitest";
import type { Plan } from "./bag.ts";
import { firstName, planName, planSchedule } from "./plan.ts";

const PLAN: Plan = {
  coffee: "huila",
  bags: 2,
  every: "four-weeks",
  grind: "press",
  gift: null,
  recipient: null,
};

describe("planSchedule", () => {
  it("says how many bags come and how often", () => {
    expect(planSchedule({ bags: 1, every: "week" })).toBe("1 bag every week");
    expect(planSchedule({ bags: 3, every: "two-weeks" })).toBe(
      "3 bags every 2 weeks",
    );
    expect(planSchedule(PLAN)).toBe("2 bags every 4 weeks");
  });
});

describe("planName", () => {
  it("names a subscription by its coffee, and a gift by who it's for", () => {
    expect(planName(PLAN)).toBe("Huila subscription");
    expect(planName({ ...PLAN, coffee: "choice" })).toBe(
      "Roaster's choice subscription",
    );
    expect(
      planName({
        ...PLAN,
        gift: 6,
        recipient: { name: "  Sam Okafor ", email: "sam@example.com" },
      }),
    ).toBe("Huila, a gift for Sam");
    expect(firstName("Ines")).toBe("Ines");
  });
});
