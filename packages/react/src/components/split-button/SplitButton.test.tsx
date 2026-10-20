import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { userEvent as keyboard } from "vitest/browser";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SplitButton } from "./SplitButton.tsx";

afterEach(cleanup);

function renderExport(handlers?: {
  readonly main?: () => void;
  readonly jpg?: () => void;
}): void {
  render(
    <SplitButton
      menuLabel="More export options"
      onClick={handlers?.main}
      items={[
        {
          label: "Export as JPG",
          onSelect: handlers?.jpg ?? (() => undefined),
        },
        { label: "Copy to clipboard", onSelect: () => undefined },
      ]}
    >
      Export PNG
    </SplitButton>,
  );
}

describe("SplitButton", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SplitButton
        ref={ref}
        className="custom"
        data-testid="export"
        menuLabel="More export options"
        items={[]}
      >
        Export
      </SplitButton>,
    );
    expect(ref.current?.dataset["bt"]).toBe("SplitButton");
    expect(ref.current?.dataset["testid"]).toBe("export");
    expect(ref.current?.className).toBe("bt-split-button custom");
  });

  it("is two named buttons in one 36px pill, with a centered divider half its height", () => {
    renderExport();
    const main = screen.getByRole("button", { name: "Export PNG" });
    const menu = screen.getByRole("button", { name: "More export options" });
    const group = main.parentElement;
    if (!group) throw new Error("no group");
    expect(group.getBoundingClientRect().height).toBe(36);
    const divider = group.querySelector('[data-bt-part="divider"]');
    const box = divider?.getBoundingClientRect();
    expect(box?.height).toBe(18);
    expect((box?.top ?? 0) - group.getBoundingClientRect().top).toBe(9);
    expect(menu.getBoundingClientRect().width).toBe(36);
  });

  it("runs the main action from its own half", async () => {
    const main = vi.fn();
    renderExport({ main });
    await userEvent.click(screen.getByRole("button", { name: "Export PNG" }));
    expect(main).toHaveBeenCalledTimes(1);
  });

  it("opens the menu from the chevron and runs the chosen entry", async () => {
    const jpg = vi.fn();
    renderExport({ jpg });
    await userEvent.click(
      screen.getByRole("button", { name: "More export options" }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: "Export as JPG" }),
    );
    expect(jpg).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
  });

  it("works from the keyboard: arrows move through the items, Enter picks one, Escape closes", async () => {
    const jpg = vi.fn();
    renderExport({ jpg });
    const menuButton = screen.getByRole("button", {
      name: "More export options",
    });
    menuButton.focus();
    await keyboard.keyboard("{Enter}");
    await screen.findByRole("menu");
    const jpgItem = screen.getByRole("menuitem", { name: "Export as JPG" });
    const copyItem = screen.getByRole("menuitem", {
      name: "Copy to clipboard",
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(jpgItem);
    });
    await keyboard.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(copyItem);
    await keyboard.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(jpgItem);
    await keyboard.keyboard("{Enter}");
    expect(jpg).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(menuButton);
    await keyboard.keyboard("{Enter}");
    await screen.findByRole("menu");
    await keyboard.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
    });
    expect(document.activeElement).toBe(menuButton);
    expect(jpg).toHaveBeenCalledTimes(1);
  });

  it("disables both halves", () => {
    render(
      <SplitButton
        disabled
        menuLabel="More export options"
        items={[{ label: "Export as JPG", onSelect: () => undefined }]}
      >
        Export PNG
      </SplitButton>,
    );
    expect(
      screen
        .getByRole("button", { name: "Export PNG" })
        .hasAttribute("disabled"),
    ).toBe(true);
    expect(
      screen
        .getByRole("button", { name: "More export options" })
        .hasAttribute("disabled"),
    ).toBe(true);
  });
});
