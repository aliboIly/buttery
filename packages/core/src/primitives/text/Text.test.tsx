import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Inline } from "../inline/Inline.tsx";
import { Text } from "./Text.tsx";

afterEach(cleanup);

describe("Text", () => {
  it("renders block roles as paragraphs and the rest as spans", () => {
    render(
      <>
        <Text variant="body">Pick a backdrop.</Text>
        <Text variant="label">Corners</Text>
      </>,
    );
    expect(screen.getByText("Pick a backdrop.").tagName).toBe("P");
    expect(screen.getByText("Corners").tagName).toBe("SPAN");
  });

  it("takes size, weight and color from the role's tokens", () => {
    render(<Text variant="title">Your canvas is empty</Text>);
    const style = getComputedStyle(screen.getByText("Your canvas is empty"));
    expect(style.fontSize).toBe("15px");
    expect(style.fontWeight).toBe("600");
    expect(style.lineHeight).toBe("20px");
  });

  it("renders its child with asChild and keeps refs working", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Text variant="dialog-title" asChild ref={ref}>
        <h2>Make it yours</h2>
      </Text>,
    );
    const heading = screen.getByRole("heading", { name: "Make it yours" });
    expect(heading.dataset["role"]).toBe("dialog-title");
    expect(ref.current).toBe(heading);
  });

  it("draws a plain link in its words in the accent, underlined, and leaves a styled link alone", () => {
    render(
      <>
        <Text variant="body-sm">
          Agree to the <a href="#terms">plan terms</a> first.
        </Text>
        <Text variant="body-sm">
          <a href="#more" className="custom-link">
            More
          </a>
        </Text>
        <span data-testid="accent" style={{ color: "var(--bt-accent-text)" }} />
      </>,
    );
    const accent = getComputedStyle(screen.getByTestId("accent")).color;
    const plain = getComputedStyle(
      screen.getByRole("link", { name: "plan terms" }),
    );
    expect(plain.color).toBe(accent);
    expect(plain.textDecorationLine).toBe("underline");
    expect(
      getComputedStyle(screen.getByRole("link", { name: "More" })).color,
    ).not.toBe(accent);
  });

  it("declares truncation and keeps the full text in the title", () => {
    render(
      <div style={{ inlineSize: "60px" }}>
        <Text truncate>A label much longer than its row</Text>
      </div>,
    );
    const text = screen.getByText("A label much longer than its row");
    expect(text.hasAttribute("data-bt-truncate")).toBe(true);
    expect(text.title).toBe("A label much longer than its row");
    expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
  });

  it("keeps a tabular number's width when its row runs out of room", () => {
    render(
      <Inline gap={2} style={{ inlineSize: "60px" }}>
        <Text truncate>Background for the spring launch card</Text>
        <Text variant="badge" tabular data-testid="value">
          135°
        </Text>
      </Inline>,
    );
    const value = screen.getByTestId("value");
    expect(value.scrollWidth).toBeLessThanOrEqual(value.clientWidth);
  });

  it("overrides the role's color with a tone", () => {
    render(
      <Text variant="body" tone="strong">
        Strong body
      </Text>,
    );
    const color = getComputedStyle(screen.getByText("Strong body")).color;
    const strong = getComputedStyle(document.documentElement)
      .getPropertyValue("--bt-text-strong")
      .trim();
    const probe = document.createElement("span");
    probe.style.color = strong;
    document.body.append(probe);
    expect(color).toBe(getComputedStyle(probe).color);
    probe.remove();
  });
});
