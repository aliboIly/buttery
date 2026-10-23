import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Download, Plus, Upload } from "lucide-react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuickActions } from "./QuickActions.tsx";

afterEach(cleanup);

describe("QuickActions", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<QuickActions ref={ref} className="custom" data-testid="quick" />);
    expect(ref.current?.dataset["bt"]).toBe("QuickActions");
    expect(ref.current?.dataset["testid"]).toBe("quick");
    expect(ref.current?.className).toBe("bt-quick-actions custom");
  });

  it("is a group of small soft buttons 8px apart that run their actions", async () => {
    const onNew = vi.fn();
    render(
      <QuickActions>
        <QuickActions.Action icon={Plus} label="New order" onSelect={onNew} />
        <QuickActions.Action
          icon={Download}
          label="Export"
          onSelect={() => undefined}
        />
      </QuickActions>,
    );
    expect(screen.getByRole("group", { name: "Quick actions" })).toBeTruthy();
    const add = screen.getByRole("button", { name: "New order" });
    const exporting = screen.getByRole("button", { name: "Export" });
    expect(add.getBoundingClientRect().height).toBe(28);
    expect(add.dataset["variant"]).toBe("soft");
    expect(
      exporting.getBoundingClientRect().left -
        add.getBoundingClientRect().right,
    ).toBe(8);
    await userEvent.click(add);
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it("folds the actions that don't fit into a menu, lowest priority first", async () => {
    const onImport = vi.fn();
    render(
      <div style={{ inlineSize: "220px" }}>
        <QuickActions>
          <QuickActions.Action
            icon={Plus}
            label="New order"
            priority={2}
            onSelect={() => undefined}
          />
          <QuickActions.Action
            icon={Download}
            label="Export"
            onSelect={() => undefined}
          />
          <QuickActions.Action
            icon={Upload}
            label="Import"
            onSelect={onImport}
          />
        </QuickActions>
      </div>,
    );
    const more = await screen.findByRole("button", {
      name: "More quick actions",
    });
    expect(screen.getByRole("button", { name: "New order" })).toBeTruthy();
    await userEvent.click(more);
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Import" }),
    );
    expect(onImport).toHaveBeenCalledTimes(1);
  });
});
