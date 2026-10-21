import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LoadingPill } from "./LoadingPill.tsx";

afterEach(cleanup);

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

describe("LoadingPill", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<LoadingPill ref={ref} className="custom" data-testid="pill" />);
    await screen.findByRole("status");
    expect(ref.current?.dataset["bt"]).toBe("LoadingPill");
    expect(ref.current?.dataset["testid"]).toBe("pill");
    expect(ref.current?.className).toBe("bt-loading-pill custom");
  });

  it("shows only once loading has lasted 300ms, as a status that says what's loading", async () => {
    render(<LoadingPill label="Loading orders" />);
    await wait(200);
    expect(screen.queryByRole("status")).toBeNull();
    const pill = await screen.findByRole("status");
    expect(pill.textContent).toBe("Loading orders");
  });

  it("never shows for a load quicker than 300ms", async () => {
    const { rerender } = render(<LoadingPill loading />);
    await wait(150);
    rerender(<LoadingPill loading={false} />);
    await wait(300);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("goes once loading ends, and waits again next time", async () => {
    const { rerender } = render(<LoadingPill loading />);
    await screen.findByRole("status");
    rerender(<LoadingPill loading={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("status")).toBeNull();
    });
    rerender(<LoadingPill loading />);
    await wait(150);
    expect(screen.queryByRole("status")).toBeNull();
    await screen.findByRole("status");
  });

  it("is a 28px pill with a 14px spinner beside its label", async () => {
    render(<LoadingPill />);
    const pill = await screen.findByRole("status");
    expect(pill.getBoundingClientRect().height).toBe(28);
    expect(getComputedStyle(pill).borderRadius).toBe("9999px");
    const spinner = pill.querySelector<HTMLElement>('[data-bt-part="spinner"]');
    const label = pill.querySelector('[data-bt-part="label"]');
    if (!spinner || !label) throw new Error("No spinner or label.");
    expect(spinner.offsetWidth).toBe(14);
    expect(spinner.getBoundingClientRect().right).toBeLessThanOrEqual(
      label.getBoundingClientRect().left,
    );
  });
});
