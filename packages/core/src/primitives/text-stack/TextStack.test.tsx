import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { TextStack } from "./TextStack.tsx";

afterEach(cleanup);

function box(text: string): DOMRect {
  return screen.getByText(text).getBoundingClientRect();
}

describe("TextStack", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TextStack
        ref={ref}
        title="Make it yours"
        className="custom"
        id="intro"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("TextStack");
    expect(ref.current?.id).toBe("intro");
    expect(ref.current?.className).toBe("bt-text-stack custom");
  });

  it("makes its title a heading, h2 unless told otherwise, with the body and caption as paragraphs", () => {
    const { rerender } = render(
      <TextStack
        title="Make it yours"
        body="Pick a backdrop and round the corners."
        caption="Tip: hold Shift for finer steps."
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "Make it yours" }),
    ).toBeTruthy();
    expect(screen.getByText("Tip: hold Shift for finer steps.").tagName).toBe(
      "P",
    );
    rerender(<TextStack title="Make it yours" titleAs="h1" />);
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    rerender(<TextStack title="Make it yours" titleAs="p" />);
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("spaces a dialog's text 16px and then 20px apart, between the trimmed text", async () => {
    render(
      <TextStack
        title="Make it yours"
        body="Pick a backdrop and round the corners."
        caption="Tip: hold Shift for finer steps."
      />,
    );
    await document.fonts.ready;
    const title = box("Make it yours");
    const body = box("Pick a backdrop and round the corners.");
    const caption = box("Tip: hold Shift for finer steps.");
    expect(Math.round(body.top - title.bottom)).toBe(16);
    expect(Math.round(caption.top - body.bottom)).toBe(20);
  });

  it("centers an empty state's title and description, 12px apart", async () => {
    render(
      <div style={{ inlineSize: "400px" }}>
        <TextStack
          size="empty"
          align="center"
          title="Your canvas is empty"
          body="Start a fresh card, or open one from your library."
        />
      </div>,
    );
    await document.fonts.ready;
    const title = box("Your canvas is empty");
    const body = box("Start a fresh card, or open one from your library.");
    expect(Math.round(body.top - title.bottom)).toBe(12);
    expect(Math.abs(title.left + title.width / 2 - 200)).toBeLessThanOrEqual(1);
    expect(screen.getByText("Your canvas is empty").dataset["role"]).toBe(
      "title",
    );
  });

  it("balances a centered stack's lines, so none is left with one word", async () => {
    render(
      <div style={{ inlineSize: "480px" }}>
        <TextStack
          size="empty"
          align="center"
          title="No orders yet"
          body="Orders show up here once a customer checks out, or when you add one by hand."
        />
      </div>,
    );
    await document.fonts.ready;
    const words = document.createRange();
    words.selectNodeContents(screen.getByText(/^Orders show up here/));
    const lines = new Map<number, number>();
    for (const line of words.getClientRects()) {
      const top = Math.round(line.top);
      lines.set(top, (lines.get(top) ?? 0) + line.width);
    }
    const widths = [...lines.values()];
    expect(widths).toHaveLength(2);
    expect(Math.min(...widths)).toBeGreaterThan(Math.max(...widths) / 2);
  });

  it("uses a page section's heading and larger body text", () => {
    render(
      <TextStack
        size="section"
        title="Every card, one place"
        body="Keep your designs together and pick up where you left off."
      />,
    );
    expect(screen.getByText("Every card, one place").dataset["role"]).toBe(
      "heading-2",
    );
    expect(
      screen.getByText(
        "Keep your designs together and pick up where you left off.",
      ).dataset["role"],
    ).toBe("body-lg");
  });
});
