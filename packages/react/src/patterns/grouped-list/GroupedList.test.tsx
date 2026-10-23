import "@butteryui/core/styles.css";
import "../../styles.css";
import { Menu, publishSettled } from "@butteryui/core";
import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GroupedList } from "./GroupedList.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Stock({
  onOpenLot,
  onAdd,
}: {
  readonly onOpenLot?: () => void;
  readonly onAdd?: () => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: "640px" }}>
      <GroupedList>
        <GroupedList.Group>
          <GroupedList.Item title="All warehouses" value="2,140 kg" />
        </GroupedList.Group>
        <GroupedList.Group
          title="Harbor Street"
          actions={<Menu.Item>Rename</Menu.Item>}
        >
          <GroupedList.Item
            title="Guji, Ethiopia"
            description="Washed"
            media={
              <span
                data-testid="media"
                style={{ inlineSize: "32px", blockSize: "32px" }}
              />
            }
            value="640 kg"
            href="#guji"
          />
          <GroupedList.Item
            title="Huila, Colombia"
            value="410 kg"
            onClick={onOpenLot}
          />
        </GroupedList.Group>
        <GroupedList.Add label="Add a warehouse" onClick={onAdd} />
      </GroupedList>
    </div>
  );
}

describe("GroupedList", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<GroupedList ref={ref} aria-label="Stock" className="custom" />);
    expect(ref.current?.dataset["bt"]).toBe("GroupedList");
    expect(ref.current?.getAttribute("aria-label")).toBe("Stock");
    expect(ref.current?.className).toBe("bt-grouped-list custom");
  });

  it("makes each group's rows a list named by its title", () => {
    render(<Stock />);
    const harbor = screen.getByRole("list", { name: "Harbor Street" });
    expect(within(harbor).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getAllByRole("list")).toHaveLength(2);
  });

  it("makes a row with href a link and one with onClick a button, each named by its text", async () => {
    const onOpenLot = vi.fn();
    render(<Stock onOpenLot={onOpenLot} />);
    const link = screen.getByRole("link", {
      name: "Guji, Ethiopia Washed 640 kg",
    });
    expect(link.getAttribute("href")).toBe("#guji");
    await userEvent.click(
      screen.getByRole("button", { name: "Huila, Colombia 410 kg" }),
    );
    expect(onOpenLot).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /All warehouses/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /All warehouses/ })).toBeNull();
  });

  it("keeps a group's actions in a … menu named for the group", async () => {
    render(<Stock />);
    await userEvent.click(
      screen.getByRole("button", { name: "Actions for Harbor Street" }),
    );
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeTruthy();
  });

  it("adds through a dashed button named by its label, a list item only inside a group", async () => {
    const onAdd = vi.fn();
    render(<Stock onAdd={onAdd} />);
    const add = screen.getByRole("button", { name: "Add a warehouse" });
    expect(add.closest("li")).toBeNull();
    await userEvent.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
    cleanup();
    render(
      <GroupedList>
        <GroupedList.Group title="Tuesday">
          <GroupedList.Add label="Add a roast" />
        </GroupedList.Group>
      </GroupedList>,
    );
    const inGroup = screen.getByRole("button", { name: "Add a roast" });
    expect(inGroup.closest("li")?.parentElement).toBe(
      screen.getByRole("list", { name: "Tuesday" }),
    );
  });

  it("ends a title that doesn't fit in an ellipsis, with the full title on hover", () => {
    const long =
      "Wholesale buyers who reorder every fortnight without a reminder";
    render(
      <div style={{ inlineSize: "240px" }}>
        <GroupedList>
          <GroupedList.Group title={long}>
            <GroupedList.Item title={`${long}, by name`} />
          </GroupedList.Group>
        </GroupedList>
      </div>,
    );
    const title = screen.getByText(long);
    expect(title.getAttribute("title")).toBe(long);
    expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    const row = screen.getByText(`${long}, by name`);
    expect(row.scrollWidth).toBeGreaterThan(row.clientWidth);
  });

  it("lays rows out 48px tall at least, lining the title up with their media", () => {
    render(<Stock />);
    const media = screen.getByTestId("media").getBoundingClientRect();
    const title = screen.getByText("Harbor Street").getBoundingClientRect();
    expect(title.left).toBe(media.left);
    for (const row of document.querySelectorAll<HTMLElement>(
      ".bt-grouped-list-row",
    )) {
      expect(row.offsetHeight).toBeGreaterThanOrEqual(48);
    }
    expect(
      screen.getByRole("button", { name: "Add a warehouse" }).offsetHeight,
    ).toBe(48);
    const well = document.querySelector<HTMLElement>(".bt-grouped-list");
    const firstRow = document.querySelector<HTMLElement>(
      ".bt-grouped-list-row",
    );
    expect(firstRow?.getBoundingClientRect().left).toBe(
      (well?.getBoundingClientRect().left ?? 0) + 4,
    );
  });
});
