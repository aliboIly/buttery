import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Text } from "@butteryui/core";
import { Page } from "./Page.tsx";

afterEach(cleanup);

describe("Page", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Page ref={ref} className="custom" data-testid="page" />);
    expect(ref.current?.dataset["bt"]).toBe("Page");
    expect(ref.current?.dataset["testid"]).toBe("page");
    expect(ref.current?.className).toBe("bt-page custom");
  });

  it("becomes the main landmark with asChild", () => {
    render(
      <Page asChild>
        <main>Content</main>
      </Page>,
    );
    expect(screen.getByRole("main").dataset["bt"]).toBe("Page");
  });

  it("sizes headlines by its own width, not the window's", () => {
    for (const [width, size] of [
      [400, "32px"],
      [800, "40px"],
      [1100, "48px"],
    ] as const) {
      render(
        <div style={{ inlineSize: `${String(width)}px` }}>
          <Page>
            <Text variant="display">Launch</Text>
          </Page>
        </div>,
      );
      expect(getComputedStyle(screen.getByText("Launch")).fontSize).toBe(size);
      cleanup();
    }
  });
});
