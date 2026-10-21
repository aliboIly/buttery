import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Button } from "../../components/button/Button.tsx";
import { SettingRow } from "./SettingRow.tsx";

afterEach(cleanup);

describe("SettingRow", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SettingRow
        ref={ref}
        title="Screen subscription renewals"
        className="custom"
        data-testid="row"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SettingRow");
    expect(ref.current?.dataset["testid"]).toBe("row");
    expect(ref.current?.className).toBe("bt-setting-row custom");
  });

  it("titles the setting with an h3, its state under it in text-secondary, its action at the end", () => {
    render(
      <div style={{ inlineSize: "640px" }}>
        <SettingRow
          title="Screen subscription renewals"
          state="Screening every renewal."
          action={<Button size="sm">Manage</Button>}
        />
      </div>,
    );
    const title = screen.getByRole("heading", {
      level: 3,
      name: "Screen subscription renewals",
    });
    const state = screen.getByText("Screening every renewal.");
    expect(state.getBoundingClientRect().top).toBeGreaterThan(
      title.getBoundingClientRect().bottom,
    );
    const muted = document.createElement("span");
    muted.style.color = "var(--bt-text-secondary)";
    document.body.append(muted);
    expect(getComputedStyle(state).color).toBe(getComputedStyle(muted).color);
    muted.remove();
    const action = screen.getByRole("button", { name: "Manage" });
    const row = document
      .querySelector('[data-bt="SettingRow"]')
      ?.getBoundingClientRect();
    if (!row) throw new Error("No row.");
    expect(action.getBoundingClientRect().right).toBe(row.right);
    const center = (box: DOMRect): number => box.top + box.height / 2;
    expect(
      Math.abs(center(action.getBoundingClientRect()) - center(row)),
    ).toBeLessThanOrEqual(0.5);
  });

  it("wraps a long title and keeps its action's size", () => {
    render(
      <>
        <div style={{ inlineSize: "280px" }}>
          <SettingRow
            title="Check cards saved for later payments against fraud rules"
            action={<Button size="sm">Turn on</Button>}
          />
        </div>
        <Button size="sm">Turn on</Button>
      </>,
    );
    const title = screen.getByRole("heading", { level: 3 });
    expect(title.getBoundingClientRect().height).toBeGreaterThan(30);
    const [inRow, alone] = screen
      .getAllByRole("button", { name: "Turn on" })
      .map((button) => button.getBoundingClientRect());
    expect(inRow?.height).toBe(28);
    expect(inRow?.width).toBe(alone?.width);
  });
});
