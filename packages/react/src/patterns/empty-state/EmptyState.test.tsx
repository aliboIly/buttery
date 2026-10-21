import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { EmptyState } from "./EmptyState.tsx";

afterEach(cleanup);

describe("EmptyState", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <EmptyState
        ref={ref}
        title="An empty canvas"
        className="custom"
        data-testid="empty"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("EmptyState");
    expect(ref.current?.className).toBe("bt-empty-state custom");
    expect(ref.current?.dataset["testid"]).toBe("empty");
  });

  it("centers a heading and its line, with the actions 24px under the text", () => {
    render(
      <EmptyState
        title="An empty canvas"
        description="Start a fresh card, or open one from your library."
        actions={
          <>
            <Button variant="primary">New card</Button>
            <Button variant="secondary">Open library</Button>
          </>
        }
      />,
    );
    expect(
      screen.getByRole("heading", { name: "An empty canvas", level: 2 }),
    ).toBeTruthy();
    const text = document
      .querySelector<HTMLElement>('[data-bt="TextStack"]')
      ?.getBoundingClientRect();
    const actions = document
      .querySelector<HTMLElement>('[data-bt-part="actions"]')
      ?.getBoundingClientRect();
    expect(Math.round((actions?.top ?? 0) - (text?.bottom ?? 0))).toBe(24);
    const primary = screen
      .getByRole("button", { name: "New card" })
      .getBoundingClientRect();
    const secondary = screen
      .getByRole("button", { name: "Open library" })
      .getBoundingClientRect();
    expect(Math.round(secondary.left - primary.right)).toBe(8);
  });

  it("leaves out the actions row when there are none", () => {
    render(<EmptyState title="Nothing here yet" />);
    expect(document.querySelector('[data-bt-part="actions"]')).toBeNull();
  });
});
