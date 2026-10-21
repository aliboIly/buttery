import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HeaderBar } from "../header-bar/HeaderBar.tsx";
import { Inspector } from "../inspector/Inspector.tsx";
import { AppShell } from "./AppShell.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Editor({
  width,
  open,
  onOpenChange,
}: {
  readonly width: string;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: width, blockSize: "600px" }}>
      <AppShell
        open={open}
        onOpenChange={onOpenChange}
        header={<HeaderBar title="Launch card" />}
        inspector={
          <Inspector label="Card settings">
            <Inspector.Section title="Card">
              <Inspector.Row label="Edge">
                <button type="button">Plain</button>
              </Inspector.Row>
            </Inspector.Section>
          </Inspector>
        }
        inspectorLabel="Card settings"
      >
        <div data-testid="stage">Stage</div>
      </AppShell>
    </div>
  );
}

describe("AppShell", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AppShell
        ref={ref}
        header={null}
        inspector={null}
        inspectorLabel="Settings"
        className="custom"
        data-testid="shell"
      >
        <p>Stage</p>
      </AppShell>,
    );
    expect(ref.current?.dataset["bt"]).toBe("AppShell");
    expect(ref.current?.className).toBe("bt-app-shell custom");
    expect(ref.current?.dataset["testid"]).toBe("shell");
  });

  it("puts the header over the stage, with the inspector full height beside them", () => {
    render(<Editor width="1100px" />);
    const header = document
      .querySelector<HTMLElement>('[data-bt="HeaderBar"]')
      ?.getBoundingClientRect();
    const stage = screen.getByTestId("stage").getBoundingClientRect();
    const inspector = screen
      .getByRole("region", { name: "Card settings" })
      .getBoundingClientRect();
    expect(Math.round(stage.top - (header?.bottom ?? 0))).toBe(8);
    expect(Math.round(inspector.left - stage.right)).toBe(8);
    expect(inspector.width).toBe(340);
    expect(Math.round(inspector.top)).toBe(Math.round(header?.top ?? 0));
    expect(Math.round(inspector.bottom)).toBe(Math.round(stage.bottom));
  });

  it("keeps its work at most 1380px wide, centered", () => {
    render(<Editor width="1700px" />);
    const header = document
      .querySelector<HTMLElement>('[data-bt="HeaderBar"]')
      ?.getBoundingClientRect();
    const inspector = screen
      .getByRole("region", { name: "Card settings" })
      .getBoundingClientRect();
    expect(Math.round(inspector.right - (header?.left ?? 0))).toBe(1380);
    expect(Math.round(header?.left ?? 0)).toBe(Math.round((1700 - 1380) / 2));
  });

  it("moves the inspector into a sheet on a narrow screen, opened from a button under the stage", async () => {
    render(<Editor width="390px" />);
    expect(screen.queryByRole("region", { name: "Card settings" })).toBeNull();
    const edit = screen.getByRole("button", { name: "Edit" });
    expect(edit.getBoundingClientRect().top).toBeGreaterThan(
      screen.getByTestId("stage").getBoundingClientRect().bottom,
    );
    await userEvent.click(edit);
    const sheet = await screen.findByRole("dialog", { name: "Card settings" });
    expect(sheet.querySelector('[data-bt="Inspector"]')).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(edit);
  });

  it("closes the sheet when the screen widens, takes focus along to the inspector beside the stage, and leaves it closed when it narrows again", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Editor width="390px" onOpenChange={onOpenChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    const sheet = await screen.findByRole("dialog", { name: "Card settings" });
    expect(sheet.contains(document.activeElement)).toBe(true);
    rerender(<Editor width="1100px" onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    const inline = document.querySelector('[data-bt-part="inspector"]');
    expect(inline?.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(inline);
    rerender(<Editor width="390px" onOpenChange={onOpenChange} />);
    await screen.findByRole("button", { name: "Edit" });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("can be controlled", async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Editor width="390px" open onOpenChange={onOpenChange} />,
    );
    expect(
      await screen.findByRole("dialog", { name: "Card settings" }),
    ).toBeTruthy();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Card settings" })).toBeTruthy();
    rerender(<Editor width="390px" open={false} onOpenChange={onOpenChange} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
