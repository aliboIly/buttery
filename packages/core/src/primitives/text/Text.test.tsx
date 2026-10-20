import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
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
