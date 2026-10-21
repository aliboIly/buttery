import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ShoppingBag, Store } from "lucide-react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { ChoiceDialog } from "./ChoiceDialog.tsx";
import type { DialogChoice } from "./ChoiceDialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function choices(onSelect?: () => void): DialogChoice[] {
  return [
    {
      id: "retail",
      icon: ShoppingBag,
      title: "Retail order",
      description: "One customer, shipped to their door.",
      href: "#retail",
    },
    {
      id: "wholesale",
      icon: Store,
      title: "Wholesale order",
      description: "Cases for a café.",
      onSelect,
    },
  ];
}

describe("ChoiceDialog", () => {
  it("stamps data-bt on its content and forwards its ref to the dialog", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ChoiceDialog
        ref={ref}
        defaultOpen
        title="What kind of order?"
        choices={choices()}
        className="custom"
      />,
    );
    const content = document.querySelector<HTMLElement>(
      "[data-bt='ChoiceDialog']",
    );
    expect(content?.className).toBe("bt-choice-dialog custom");
    expect(ref.current?.dataset["bt"]).toBe("Dialog");
    expect(ref.current?.dataset["size"]).toBe("md");
  });

  it("opens from its trigger, named by its title, focus on the first choice", async () => {
    render(
      <ChoiceDialog
        trigger={<Button>New order</Button>}
        title="What kind of order?"
        description="Each kind has its own form."
        choices={choices()}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "New order" }));
    const dialog = await screen.findByRole("dialog", {
      name: "What kind of order?",
    });
    expect(dialog.getAttribute("aria-describedby")).not.toBeNull();
    const first = within(dialog).getByRole("link", {
      name: "Retail order One customer, shipped to their door.",
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(first);
    });
    expect(first.getAttribute("href")).toBe("#retail");
  });

  it("runs a choice and closes, focus going back to the trigger", async () => {
    const onSelect = vi.fn();
    render(
      <ChoiceDialog
        trigger={<Button>New order</Button>}
        title="What kind of order?"
        choices={choices(onSelect)}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "New order" }));
    await userEvent.click(
      await screen.findByRole("button", { name: /^Wholesale order/ }),
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "New order" }),
    );
  });

  it("lays a row out as its icon tile, its text and an arrow that draws its stem on hover", async () => {
    render(
      <ChoiceDialog
        defaultOpen
        title="What kind of order?"
        choices={choices()}
      />,
    );
    const row = await screen.findByRole("link", { name: /^Retail order/ });
    const tile = row.querySelector<HTMLElement>('[data-bt-part="tile"]');
    expect(tile?.offsetWidth).toBe(36);
    const stem = row.querySelector('[data-bt-part="arrow-stem"]');
    const scale = (): number =>
      Number.parseFloat(stem ? getComputedStyle(stem).scale : "0");
    expect(scale()).toBe(0);
    await browser.hover(row);
    await waitFor(() => {
      expect(scale()).toBeGreaterThan(0.5);
    });
  });

  it("runs a button choice and closes whatever key is held, since only a link can open elsewhere", async () => {
    const onSelect = vi.fn();
    render(
      <ChoiceDialog
        defaultOpen
        title="What kind of order?"
        choices={choices(onSelect)}
      />,
    );
    await screen.findByRole("dialog");
    await browser.click(
      screen.getByRole("button", { name: /Wholesale order/ }),
      {
        modifiers: ["Shift"],
      },
    );
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes after a choice whose handler stops the link, as a router's does, with its style on its content", async () => {
    const onSelect = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <ChoiceDialog
        defaultOpen
        title="What kind of order?"
        style={{ minBlockSize: "120px" }}
        choices={[
          {
            id: "retail",
            icon: ShoppingBag,
            title: "Retail order",
            href: "#retail",
            onSelect,
          },
        ]}
      />,
    );
    const dialog = await screen.findByRole("dialog");
    expect(
      dialog.querySelector<HTMLElement>('[data-bt="ChoiceDialog"]')?.style
        .minBlockSize,
    ).toBe("120px");
    await userEvent.click(screen.getByRole("link", { name: /Retail order/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
