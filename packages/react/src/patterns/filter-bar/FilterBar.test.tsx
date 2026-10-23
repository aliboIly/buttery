import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SearchField } from "../../components/search-field/SearchField.tsx";
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

  it("narrows a search in its actions before the folded Filters button gives up any of its label", () => {
    render(
      <div style={{ inlineSize: "280px" }}>
        <FilterBar
          actions={
            <SearchField
              label="Search orders"
              placeholder="Order or customer"
              variant="outline"
            />
          }
        >
          <FilterPill label="Status">Paid</FilterPill>
        </FilterBar>
      </div>,
    );
    const folded = screen.getByRole("button", { name: "Filters" });
    const label = folded.querySelector<HTMLElement>(".bt-truncate");
    if (!label) throw new Error("No label.");
    expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth);
    const bar = document.querySelector<HTMLElement>(".bt-filter-bar");
    if (!bar) throw new Error("No bar.");
    expect(bar.scrollWidth).toBeLessThanOrEqual(bar.clientWidth);
  });

  it("centers a line of pills on taller actions, folded or not, and keeps the actions on the first line once the pills wrap", () => {
    const middle = (box: DOMRect): number => box.top + box.height / 2;
    const bar = (width: number, pills: number): ReactElement => (
      <div style={{ inlineSize: `${String(width)}px` }}>
        <FilterBar
          actions={<SearchField label="Search orders" variant="outline" />}
        >
          {Array.from({ length: pills }, (_, index) => (
            <FilterPill
              key={index}
              label={`Field ${String(index + 1)}`}
              value="Some value"
              onRemove={() => undefined}
            />
          ))}
        </FilterBar>
      </div>
    );
    const search = (): DOMRect => {
      const box = screen
        .getByRole("searchbox", { name: "Search orders" })
        .closest('[data-bt="SearchField"]');
      if (!box) throw new Error("No search box.");
      return box.getBoundingClientRect();
    };
    render(bar(900, 1));
    const field = search();
    expect(field.height).toBe(34);
    const pill = screen
      .getByRole("button", { name: "Field 1: Some value" })
      .closest('[data-bt="FilterPill"]');
    if (!pill) throw new Error("No pill.");
    expect(middle(pill.getBoundingClientRect())).toBe(middle(field));
    cleanup();
    render(bar(500, 1));
    expect(
      middle(
        screen
          .getByRole("button", { name: "Filters · 1" })
          .getBoundingClientRect(),
      ),
    ).toBe(middle(search()));
    cleanup();
    render(bar(700, 6));
    const pills = document.querySelector('[data-bt-part="pills"]');
    if (!pills) throw new Error("No pills.");
    const block = pills.getBoundingClientRect();
    expect(block.height).toBeGreaterThan(2 * search().height);
    expect(search().top).toBe(block.top);
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

  it("still folds under 640px when given a ref", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <div style={{ inlineSize: "500px" }}>
        <FilterBar ref={ref}>
          <FilterPill label="Status" value="Paid" />
        </FilterBar>
      </div>,
    );
    expect(ref.current?.dataset["bt"]).toBe("FilterBar");
    expect(screen.getByRole("button", { name: "Filters · 1" })).toBeTruthy();
  });

  it("counts applied pills inside fragments, and takes a count for pills inside components", () => {
    function StatusFilter(): ReactElement {
      return <FilterPill label="Status" value="Paid" />;
    }
    render(
      <>
        <div style={{ inlineSize: "500px" }}>
          <FilterBar>
            <>
              <FilterPill label="Status" value="Paid" />
              <FilterPill label="Origin" />
            </>
          </FilterBar>
        </div>
        <div style={{ inlineSize: "900px" }}>
          <FilterBar applied={1} onClearAll={() => undefined}>
            <StatusFilter />
          </FilterBar>
        </div>
      </>,
    );
    expect(screen.getByRole("button", { name: "Filters · 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeTruthy();
  });

  it("forwards a pill's ref, classes and props, and starts its editor open with defaultOpen", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FilterPill
        ref={ref}
        className="status"
        data-testid="pill"
        label="Status"
        defaultOpen
      >
        <button type="button">Paid</button>
      </FilterPill>,
    );
    expect(ref.current?.classList.contains("status")).toBe(true);
    expect(screen.getByTestId("pill")).toBe(ref.current);
    expect(await screen.findByRole("button", { name: "Paid" })).toBeTruthy();
  });
});
