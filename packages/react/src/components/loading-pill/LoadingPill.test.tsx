import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LoadingPill } from "./LoadingPill.tsx";

afterEach(cleanup);

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function pill(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-bt="LoadingPill"]');
}

async function shown(): Promise<HTMLElement> {
  return waitFor(() => {
    const element = pill();
    if (!element) throw new Error("The pill hasn't shown.");
    return element;
  });
}

describe("LoadingPill", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<LoadingPill ref={ref} className="custom" data-testid="pill" />);
    await shown();
    expect(ref.current?.dataset["bt"]).toBe("LoadingPill");
    expect(ref.current?.dataset["testid"]).toBe("pill");
    expect(ref.current?.className).toBe("bt-loading-pill custom");
  });

  it("shows only once loading has lasted 300ms, announcing what's loading in a status mounted from the start", async () => {
    render(<LoadingPill label="Loading orders" />);
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    await wait(200);
    expect(pill()).toBeNull();
    await shown();
    expect(status.textContent).toBe("Loading orders");
    expect(pill()?.getAttribute("aria-hidden")).toBe("true");
  });

  it("shows without a status when something around it says it's loading", async () => {
    render(<LoadingPill label="Loading orders" announce={false} />);
    await shown();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("never shows for a load quicker than 300ms", async () => {
    const { rerender } = render(<LoadingPill loading />);
    await wait(150);
    rerender(<LoadingPill loading={false} />);
    await wait(300);
    expect(pill()).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("goes once loading ends, and waits again next time", async () => {
    const { rerender } = render(<LoadingPill loading />);
    await shown();
    rerender(<LoadingPill loading={false} />);
    expect(screen.getByRole("status").textContent).toBe("");
    await waitFor(() => {
      expect(pill()).toBeNull();
    });
    rerender(<LoadingPill loading />);
    await wait(150);
    expect(pill()).toBeNull();
    await shown();
  });

  it("is a 28px pill with a 14px spinner beside its label", async () => {
    render(<LoadingPill />);
    const element = await shown();
    expect(element.getBoundingClientRect().height).toBe(28);
    expect(getComputedStyle(element).borderRadius).toBe("9999px");
    const spinner = element.querySelector<HTMLElement>(
      '[data-bt-part="spinner"]',
    );
    const label = element.querySelector('[data-bt-part="label"]');
    if (!spinner || !label) throw new Error("No spinner or label.");
    expect(spinner.offsetWidth).toBe(14);
    expect(spinner.getBoundingClientRect().right).toBeLessThanOrEqual(
      label.getBoundingClientRect().left,
    );
  });
});
