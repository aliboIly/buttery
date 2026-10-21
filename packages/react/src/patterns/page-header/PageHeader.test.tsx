import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as browser } from "vitest/browser";
import { Download, Plus, Upload } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageHeader } from "./PageHeader.tsx";

afterEach(cleanup);

function Orders({
  width = 900,
  onNew = () => undefined,
}: {
  readonly width?: number;
  readonly onNew?: () => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <PageHeader
        title="Orders"
        value="1,284"
        valueInfo="Orders placed in the last 30 days."
        actions={
          <>
            <PageHeader.Action
              icon={Upload}
              label="Import"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              icon={Download}
              label="Export"
              onSelect={() => undefined}
            />
            <PageHeader.Action
              variant="primary"
              icon={Plus}
              label="New order"
              shortcut="n"
              priority={1}
              onSelect={onNew}
            />
          </>
        }
      >
        <p data-testid="row">Tabs go here</p>
      </PageHeader>
    </div>
  );
}

describe("PageHeader", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <PageHeader
        ref={ref}
        title="Orders"
        className="custom"
        data-testid="header"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("PageHeader");
    expect(ref.current?.dataset["testid"]).toBe("header");
    expect(ref.current?.className).toBe("bt-page-header custom");
  });

  it("titles the page with an h1 in title-lg, its value 8px after in regular weight, then an info button", async () => {
    render(<Orders />);
    const title = screen.getByRole("heading", { level: 1, name: "Orders" });
    expect(getComputedStyle(title).fontSize).toBe("24px");
    const value = screen.getByText("1,284");
    expect(
      value.getBoundingClientRect().left - title.getBoundingClientRect().right,
    ).toBe(8);
    expect(getComputedStyle(value).fontWeight).toBe("400");
    const info = screen.getByRole("button", {
      name: "Orders placed in the last 30 days.",
    });
    expect(info.getBoundingClientRect().height).toBe(28);
    await browser.hover(info);
    expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Orders placed in the last 30 days.",
    );
  });

  it("opens its value's explanation on a tap, where no tooltip shows", async () => {
    render(<Orders />);
    const user = userEvent.setup();
    await user.pointer({
      keys: "[TouchA]",
      target: screen.getByRole("button", {
        name: "Orders placed in the last 30 days.",
      }),
    });
    expect(
      await screen.findByRole("dialog", {
        name: "Orders placed in the last 30 days.",
      }),
    ).toBeTruthy();
  });

  it("puts its actions at the end, 8px apart, the primary one with its shortcut", async () => {
    const onNew = vi.fn();
    render(<Orders onNew={onNew} />);
    const exporting = screen.getByRole("button", { name: "Export" });
    const create = screen.getByRole("button", { name: "New order" });
    expect(
      create.getBoundingClientRect().left -
        exporting.getBoundingClientRect().right,
    ).toBe(8);
    expect(create.getAttribute("aria-keyshortcuts")).toBe("N");
    const bar = document.querySelector('[data-bt-part="bar"]');
    expect(Math.round(create.getBoundingClientRect().right)).toBe(
      Math.round(bar?.getBoundingClientRect().right ?? 0),
    );
    await userEvent.click(create);
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("folds its actions into a menu before the title truncates, keeping the primary longest", async () => {
    render(<Orders width={420} />);
    const more = await screen.findByRole("button", { name: "More actions" });
    expect(screen.getByRole("button", { name: "New order" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Import" })).toBeNull();
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.scrollWidth).toBeLessThanOrEqual(title.clientWidth);
    await userEvent.click(more);
    expect(
      await screen.findByRole("menuitem", { name: "Import" }),
    ).toBeTruthy();
  });

  it("puts the rows under it 16px down", () => {
    render(<Orders />);
    const bar = document.querySelector('[data-bt-part="bar"]');
    const row = screen.getByTestId("row");
    expect(
      row.getBoundingClientRect().top -
        (bar?.getBoundingClientRect().bottom ?? 0),
    ).toBe(16);
  });
});
