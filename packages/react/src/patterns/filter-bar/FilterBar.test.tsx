import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FilterBar, FilterPill } from "./FilterBar.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Filters({ width = 900 }: { readonly width?: number }): ReactElement {
  const [status, setStatus] = useState<string | undefined>("Paid");
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <FilterBar
        onClearAll={() => {
          setStatus(undefined);
          setOrigin(undefined);
        }}
        actions={<button type="button">Export</button>}
      >
        <FilterPill
          label="Status"
          value={status}
          onRemove={() => {
            setStatus(undefined);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setStatus("Refunded");
            }}
          >
            Refunded
          </button>
        </FilterPill>
        <FilterPill
          label="Origin"
          value={origin}
          onRemove={() => {
            setOrigin(undefined);
          }}
        >
          <button
            type="button"
            onClick={() => {
              setOrigin("Ethiopia");
            }}
          >
            Ethiopia
          </button>
        </FilterPill>
      </FilterBar>
    </div>
  );
}

describe("FilterBar", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FilterBar ref={ref} className="custom" data-testid="filters" />);
    expect(ref.current?.dataset["bt"]).toBe("FilterBar");
    expect(ref.current?.dataset["testid"]).toBe("filters");
    expect(ref.current?.className).toBe("bt-filter-bar custom");
  });

  it("is a group of 28px pills, an applied one solid with a remove button, an unapplied one dashed", () => {
    render(<Filters />);
    const group = screen.getByRole("group", { name: "Filters" });
    const status = within(group).getByRole("button", { name: "Status: Paid" });
    const pill = status.closest('[data-bt="FilterPill"]');
    expect(pill?.getBoundingClientRect().height).toBe(28);
    expect(getComputedStyle(pill ?? group).outlineStyle).toBe("solid");
    expect(
      within(group).getByRole("button", { name: "Remove Status" }),
    ).toBeTruthy();
    const origin = within(group)
      .getByRole("button", { name: "Origin" })
      .closest('[data-bt="FilterPill"]');
    expect(getComputedStyle(origin ?? group).outlineStyle).toBe("dashed");
    expect(status.getBoundingClientRect().height).toBe(28);
  });

  it("opens a pill's editor in a popover, removes a filter, and clears them all", async () => {
    render(<Filters />);
    await userEvent.click(screen.getByRole("button", { name: "Origin" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "Ethiopia" }),
    );
    expect(
      screen.getByRole("button", { name: "Origin: Ethiopia" }),
    ).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove Status" }),
    );
    expect(screen.getByRole("button", { name: "Status" })).toBeTruthy();
    await userEvent.click(
      screen.getByRole("button", { name: "Clear filters" }),
    );
    expect(screen.queryByRole("button", { name: "Clear filters" })).toBeNull();
    expect(screen.getByRole("button", { name: "Origin" })).toBeTruthy();
  });

  it("folds its pills into one Filters button under 640px, which opens them", async () => {
    render(<Filters width={500} />);
    const folded = screen.getByRole("button", { name: "Filters · 1" });
    expect(screen.queryByRole("button", { name: "Status: Paid" })).toBeNull();
    await userEvent.click(folded);
    expect(
      await screen.findByRole("button", { name: "Status: Paid" }),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Export" })).toBeTruthy();
  });

  it("keeps a remove button's press area 24px square", () => {
    const onRemove = vi.fn();
    render(
      <FilterPill label="Status" value="Paid" onRemove={onRemove}>
        Editor
      </FilterPill>,
    );
    const hit = screen
      .getByRole("button", { name: "Remove Status" })
      .querySelector('[data-bt-part="hit"]');
    const box = hit?.getBoundingClientRect();
    expect([box?.width, box?.height]).toEqual([24, 24]);
  });
});
