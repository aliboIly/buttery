import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Callout } from "./Callout.tsx";

afterEach(cleanup);

describe("Callout", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Callout ref={ref} className="custom" role="status" title="Saved">
        It&apos;s in your downloads.
      </Callout>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Callout");
    expect(ref.current?.className).toBe("bt-callout custom");
    expect(screen.getByRole("status").textContent).toContain("Saved");
  });

  it("tints each tone and colors its icon to match", () => {
    render(
      <>
        <Callout tone="danger" title="Couldn't sign in" data-testid="danger" />
        <Callout tone="success" title="Exported" data-testid="success" />
      </>,
    );
    const danger = screen.getByTestId("danger");
    expect(getComputedStyle(danger).backgroundColor).toBe("rgb(253, 236, 235)");
    expect(getComputedStyle(danger.querySelector("svg") ?? danger).color).toBe(
      "rgb(199, 42, 28)",
    );
    expect(
      getComputedStyle(screen.getByTestId("success")).backgroundColor,
    ).toBe("rgb(231, 245, 237)");
  });

  it("draws an outline in the tone's color on the surface, or a bar on its start edge over the tint", () => {
    render(
      <>
        <Callout
          tone="danger"
          variant="outline"
          title="Couldn't sign in"
          data-testid="outline"
        />
        <Callout
          tone="success"
          variant="accent"
          title="Exported"
          data-testid="accent"
        />
        <Callout tone="success" title="Exported" data-testid="soft" />
      </>,
    );
    const outline = getComputedStyle(screen.getByTestId("outline"));
    expect(outline.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(outline.borderTopWidth).toBe("1px");
    expect(outline.borderTopColor).toBe("rgb(199, 42, 28)");
    expect(outline.borderLeftWidth).toBe("1px");
    const accent = getComputedStyle(screen.getByTestId("accent"));
    expect(accent.backgroundColor).toBe("rgb(231, 245, 237)");
    expect(accent.borderLeftWidth).toBe("4px");
    expect(accent.borderLeftColor).toBe("rgb(23, 114, 69)");
    expect(accent.borderTopWidth).toBe("0px");
    const soft = getComputedStyle(screen.getByTestId("soft"));
    expect(soft.borderLeftWidth).toBe("0px");
    expect(soft.borderTopWidth).toBe("0px");
  });

  it("centers its icon on the first line, with a title or without", () => {
    render(
      <>
        <Callout title="Saved to your library">Find it under Recent.</Callout>
        <Callout>Find it under Recent.</Callout>
      </>,
    );
    for (const callout of document.querySelectorAll(".bt-callout")) {
      const icon = callout
        .querySelector(":scope > svg")
        ?.getBoundingClientRect();
      const first = callout.querySelector('[data-bt-part="content"] > *');
      if (!icon || !first) throw new Error("no icon or content");
      const line = Number.parseFloat(getComputedStyle(first).lineHeight);
      const lineCenter = first.getBoundingClientRect().top + line / 2;
      expect(icon.top + icon.height / 2).toBeCloseTo(lineCenter, 0);
      expect(icon.width).toBe(16);
    }
  });

  it("is a plain box without a role unless it's given one", () => {
    render(<Callout title="Shared cards stay in sync" data-testid="note" />);
    expect(screen.getByTestId("note").hasAttribute("role")).toBe(false);
  });
});
