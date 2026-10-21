import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { PlanComparison } from "./PlanComparison.tsx";
import type { PlanComparisonPlan } from "./PlanComparison.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const PLANS: readonly PlanComparisonPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "For a roastery selling to its own customers.",
    price: "$19",
    period: "per month",
    action: <Button variant="primary">Choose Starter</Button>,
    featuresTitle: "Includes",
    features: ["Online shop", "Subscriptions"],
  },
  {
    id: "roaster",
    name: "Roaster",
    description:
      "For a roastery that also sells to cafés, with price lists, wholesale accounts and roast planning for both.",
    price: "$39",
    period: "per month",
    ribbon: "30 days free",
    action: <Button variant="primary">Try Roaster</Button>,
    featuresTitle: "Everything in Starter, and",
    features: ["Wholesale accounts", "Price lists", "Roast planning"],
  },
];

function Plans({
  width = 1000,
  onPeriodChange,
}: {
  readonly width?: number;
  readonly onPeriodChange?: (period: string) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <PlanComparison
        plans={PLANS}
        periods={[
          { value: "monthly", label: "Monthly" },
          { value: "yearly", label: "Yearly" },
        ]}
        onPeriodChange={onPeriodChange}
        volumes={[
          { value: "small", label: "Up to 200 orders" },
          { value: "large", label: "Up to 2,000 orders" },
        ]}
        more={
          <PlanComparison.Option
            name="Enterprise"
            description="Prices for roasteries with several sites."
            action={<Button size="sm">Talk to us</Button>}
          />
        }
      />
    </div>
  );
}

function card(name: string): HTMLElement {
  return screen.getByRole("region", { name });
}

function box(element: Element | null): DOMRect {
  if (!element) throw new Error("Not there.");
  return element.getBoundingClientRect();
}

describe("PlanComparison", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PlanComparison
        ref={ref}
        plans={PLANS}
        className="custom"
        data-testid="plans"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("PlanComparison");
    expect(ref.current?.dataset["testid"]).toBe("plans");
    expect(ref.current?.className).toBe("bt-plan-comparison custom");
  });

  it("joins the billing period and the volume in one outlined control group", async () => {
    const onPeriodChange = vi.fn();
    render(<Plans onPeriodChange={onPeriodChange} />);
    const group = screen.getByRole("group", { name: "Plan options" });
    expect(
      within(group).getByRole("radiogroup", { name: "Billing period" }),
    ).toBeTruthy();
    expect(
      within(group).getByRole("button", { name: /^Volume, Up to 200 orders/ }),
    ).toBeTruthy();
    expect(getComputedStyle(group).borderTopWidth).toBe("1px");
    await userEvent.click(within(group).getByRole("radio", { name: "Yearly" }));
    expect(onPeriodChange).toHaveBeenCalledWith("yearly");
  });

  it("lines up each plan's price, action and checklist across the cards, whatever their text's length", () => {
    render(<Plans />);
    const starter = card("Starter");
    const roaster = card("Roaster");
    expect(box(starter).top).toBe(box(roaster).top);
    expect(box(starter).height).toBe(box(roaster).height);
    const top = (scope: HTMLElement, part: string): number =>
      box(scope.querySelector(`[data-bt-part="${part}"]`)).top;
    for (const part of ["price", "plan-comparison-action", "features"])
      expect(top(starter, part)).toBe(top(roaster, part));
    expect(
      box(within(roaster).getByRole("button", { name: "Try Roaster" })).width,
    ).toBe(
      box(roaster.querySelector('[data-bt-part="plan-comparison-action"]'))
        .width,
    );
  });

  it("puts a plan's ribbon on a tab above its card and its checklist under a heading", () => {
    render(<Plans />);
    const ribbon = screen.getByText("30 days free");
    expect(box(ribbon).bottom).toBeLessThanOrEqual(
      box(card("Roaster")).top + 1,
    );
    expect(
      within(card("Roaster")).getByRole("heading", {
        level: 4,
        name: "Everything in Starter, and",
      }),
    ).toBeTruthy();
    expect(
      within(card("Roaster"))
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(["Wholesale accounts", "Price lists", "Roast planning"]);
  });

  it("lists other plans under a heading after the cards", () => {
    render(<Plans />);
    const more = screen.getByRole("region", { name: "Other plans" });
    expect(box(more).top).toBeGreaterThan(box(card("Starter")).bottom);
    expect(
      within(more).getByRole("region", { name: "Enterprise" }),
    ).toBeTruthy();
  });

  it("stacks the cards under 900px of room", () => {
    render(<Plans width={600} />);
    expect(box(card("Roaster")).top).toBeGreaterThan(
      box(card("Starter")).bottom,
    );
  });

  it("makes each card its own region, so each may hold one primary action", () => {
    render(<Plans />);
    expect(card("Starter").hasAttribute("data-bt-region")).toBe(true);
    expect(card("Roaster").hasAttribute("data-bt-region")).toBe(true);
  });
});
