import "@buttery/core/styles.css";
import "../../styles.css";
import { Menu, publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SavedViews } from "./SavedViews.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const VIEWS = [
  { id: "all", label: "All orders" },
  { id: "unpaid", label: "Unpaid" },
  { id: "wholesale", label: "Wholesale" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "refunds", label: "Refunds this month" },
];

function Views({
  width = 800,
  onValueChange,
  onSaveAs,
}: {
  readonly width?: number;
  readonly onValueChange?: (id: string) => void;
  readonly onSaveAs?: () => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <SavedViews
        label="Order views"
        views={VIEWS}
        onValueChange={onValueChange}
        onSaveAs={onSaveAs}
        actions={<Menu.Item>Rename</Menu.Item>}
      />
    </div>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

describe("SavedViews", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SavedViews
        ref={ref}
        label="Views"
        views={VIEWS}
        className="custom"
        data-testid="views"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("SavedViews");
    expect(ref.current?.dataset["testid"]).toBe("views");
    expect(ref.current?.className).toBe("bt-saved-views custom");
  });

  it("is a radio group of views in a 34px track, the first chosen on a raised pill", async () => {
    render(<Views />);
    expect(
      screen.getByRole("radiogroup", { name: "Order views" }),
    ).toBeTruthy();
    const all = screen.getByRole("radio", { name: "All orders" });
    expect(all.getAttribute("aria-checked")).toBe("true");
    const track = document.querySelector('[data-bt-part="saved-views-track"]');
    expect(track?.getBoundingClientRect().height).toBe(34);
    await settled();
    expect(all.querySelector('[data-bt-part="indicator"]')).not.toBeNull();
  });

  it("chooses a view, moving the pill to it", async () => {
    const onValueChange = vi.fn();
    render(<Views onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Unpaid" }));
    expect(onValueChange).toHaveBeenCalledWith("unpaid");
    await settled();
    expect(
      screen
        .getByRole("radio", { name: "Unpaid" })
        .querySelector('[data-bt-part="indicator"]'),
    ).not.toBeNull();
  });

  it("lists every view, the chosen one checked, then actions and Save as a new view in its … menu", async () => {
    const onSaveAs = vi.fn();
    render(<Views onSaveAs={onSaveAs} />);
    await userEvent.click(screen.getByRole("button", { name: "More views" }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(VIEWS.length);
    expect(
      screen
        .getByRole("menuitemradio", { name: "All orders" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeTruthy();
    await userEvent.click(
      screen.getByRole("menuitem", { name: "Save as a new view" }),
    );
    expect(onSaveAs).toHaveBeenCalledTimes(1);
  });

  it("folds the views that don't fit away, keeping them in the menu", async () => {
    const onValueChange = vi.fn();
    render(<Views width={300} onValueChange={onValueChange} />);
    await waitFor(() => {
      expect(
        screen.queryByRole("radio", { name: "Refunds this month" }),
      ).toBeNull();
    });
    await userEvent.click(screen.getByRole("button", { name: "More views" }));
    await userEvent.click(
      screen.getByRole("menuitemradio", { name: "Refunds this month" }),
    );
    expect(onValueChange).toHaveBeenCalledWith("refunds");
  });

  it("keeps the chosen view in a narrow row", async () => {
    render(
      <div style={{ inlineSize: "300px" }}>
        <SavedViews label="Order views" views={VIEWS} defaultValue="refunds" />
      </div>,
    );
    await waitFor(() => {
      expect(screen.queryByRole("radio", { name: "Wholesale" })).toBeNull();
    });
    expect(
      screen
        .getByRole("radio", { name: "Refunds this month" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
});
