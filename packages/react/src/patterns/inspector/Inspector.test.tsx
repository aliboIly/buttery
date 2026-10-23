import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { Inspector } from "./Inspector.tsx";

afterEach(cleanup);

function Settings({
  onReset = () => undefined,
  resettable = true,
  sections = 1,
}: {
  readonly onReset?: () => void;
  readonly resettable?: boolean;
  readonly sections?: number;
}): ReactElement {
  return (
    <Inspector
      label="Card settings"
      style={{ blockSize: "calc(var(--bt-bento-row) * 1.5)" }}
      footer={
        <Inspector.Footer>
          <Button>Copy</Button>
        </Inspector.Footer>
      }
    >
      {Array.from({ length: sections }, (_, index) => (
        <Inspector.Section
          key={index}
          title={index === 0 ? "Card" : `Extra ${String(index)}`}
          onReset={onReset}
          resettable={resettable}
        >
          <Inspector.Row label="Edge">
            <span data-testid={`control-${String(index)}`}>Control</span>
          </Inspector.Row>
          <Inspector.Row>
            <span data-testid={`full-${String(index)}`}>Fills the row</span>
          </Inspector.Row>
          <Inspector.Row.Split>
            <Inspector.Row label="Lean" />
            <Inspector.Row label="Anchor" />
          </Inspector.Row.Split>
        </Inspector.Section>
      ))}
    </Inspector>
  );
}

describe("Inspector", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Inspector
        ref={ref}
        label="Card settings"
        className="custom"
        data-testid="panel"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Inspector");
    expect(ref.current?.className).toBe("bt-inspector bt-surface custom");
    expect(ref.current?.dataset["testid"]).toBe("panel");
  });

  it("is a named region of named sections, 340px wide on the panel surface", () => {
    render(<Settings />);
    const panel = screen.getByRole("region", { name: "Card settings" });
    expect(panel.getBoundingClientRect().width).toBe(340);
    expect(panel.dataset["level"]).toBe("panel");
    expect(screen.getByRole("region", { name: "Card" })).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Card", level: 2 }),
    ).toBeTruthy();
  });

  it("lays rows out at 50px and split rows at 64px, with the header's title on the rows' left edge", () => {
    render(<Settings />);
    const rows = document.querySelectorAll<HTMLElement>(
      '[data-bt-part="card"] > [data-bt-part="row"]',
    );
    expect(rows[0]?.getBoundingClientRect().height).toBe(50);
    const split = document.querySelector<HTMLElement>('[data-bt-part="split"]');
    expect(split?.getBoundingClientRect().height).toBe(64);
    const title = screen
      .getByRole("heading", { name: "Card" })
      .getBoundingClientRect();
    const label = screen.getByText("Edge").getBoundingClientRect();
    expect(Math.round(title.left)).toBe(Math.round(label.left));
    const header = document.querySelector<HTMLElement>(
      '[data-bt-part="header"]',
    );
    expect(header?.getBoundingClientRect().height).toBe(36);
  });

  it("puts a labelled row's control at its end and lets an unlabelled row's control fill it", () => {
    render(<Settings />);
    const row = screen
      .getByTestId("control-0")
      .parentElement?.getBoundingClientRect();
    const control = screen.getByTestId("control-0").getBoundingClientRect();
    expect(Math.round((row?.right ?? 0) - control.right)).toBe(16);
    const full = screen.getByTestId("full-0").getBoundingClientRect();
    expect(Math.round(full.width)).toBe(Math.round((row?.width ?? 0) - 32));
  });

  it("resets a section from its header, and dims Reset while there's nothing to reset", async () => {
    const onReset = vi.fn();
    const { rerender } = render(<Settings onReset={onReset} />);
    await userEvent.click(screen.getByRole("button", { name: "Reset Card" }));
    expect(onReset).toHaveBeenCalledTimes(1);
    rerender(<Settings onReset={onReset} resettable={false} />);
    const reset = screen.getByRole("button", { name: "Reset Card" });
    expect(reset.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(reset);
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("scrolls its sections inside while the footer stays at the bottom", () => {
    render(<Settings sections={6} />);
    const panel = screen
      .getByRole("region", { name: "Card settings" })
      .getBoundingClientRect();
    const body = document.querySelector<HTMLElement>('[data-bt-part="body"]');
    expect(body?.scrollHeight ?? 0).toBeGreaterThan(body?.clientHeight ?? 0);
    const footer = document
      .querySelector<HTMLElement>('[data-bt-part="footer"]')
      ?.getBoundingClientRect();
    expect(Math.round(footer?.bottom ?? 0)).toBe(Math.round(panel.bottom));
  });
});
