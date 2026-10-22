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
import { CalendarClock, Gift } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { ConsequenceDialog } from "./ConsequenceDialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Trial({
  onConfirm = () => undefined,
}: {
  readonly onConfirm?: () => void | Promise<void>;
}): ReactElement {
  return (
    <ConsequenceDialog
      trigger={<Button variant="primary">Try Roaster</Button>}
      title="Try the Roaster plan"
      items={[
        {
          icon: Gift,
          title: "First 30 days free",
          body: "You keep your Starter price during the trial.",
        },
        {
          icon: CalendarClock,
          title: "Then $39 a month",
          body: "Charged to the card on file from November 20.",
        },
      ]}
      terms={
        <>
          By starting the trial you agree to the <a href="#terms">plan terms</a>
          .
        </>
      }
      confirmLabel="Start the trial"
      onConfirm={onConfirm}
    />
  );
}

async function open(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: "Try Roaster" }));
  const dialog = await screen.findByRole("dialog", {
    name: "Try the Roaster plan",
  });
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
  return dialog;
}

describe("ConsequenceDialog", () => {
  it("stamps its class and data-bt on its content, forwards its ref to the dialog", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ConsequenceDialog
        ref={ref}
        defaultOpen
        title="Try the Roaster plan"
        items={[]}
        confirmLabel="Start the trial"
        onConfirm={() => undefined}
        className="custom"
      />,
    );
    await screen.findByRole("dialog");
    expect(
      document.querySelector("[data-bt='ConsequenceDialog']")?.className,
    ).toBe("bt-consequence-dialog custom");
    expect(ref.current?.dataset["bt"]).toBe("Dialog");
  });

  it("lists what saying yes will do, then the small print under a divider and one full-width button", async () => {
    render(<Trial />);
    const dialog = await open();
    const items = within(dialog).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "First 30 days freeYou keep your Starter price during the trial.",
      "Then $39 a monthCharged to the card on file from November 20.",
    ]);
    const terms = dialog.querySelector<HTMLElement>('[data-bt-part="terms"]');
    if (!terms) throw new Error("No terms.");
    expect(getComputedStyle(terms).borderTopWidth).toBe("1px");
    const confirm = within(dialog).getByRole("button", {
      name: "Start the trial",
    });
    const body = dialog.querySelector('[data-bt-part="body"]');
    if (!body) throw new Error("No body.");
    const inner = body.getBoundingClientRect();
    const padding = Number.parseFloat(getComputedStyle(body).paddingLeft) * 2;
    expect(confirm.getBoundingClientRect().width).toBe(inner.width - padding);
    expect(confirm.getBoundingClientRect().top).toBeGreaterThan(
      terms.getBoundingClientRect().bottom,
    );
  });

  it("puts focus on the dialog itself, so it's read before anything is confirmed", async () => {
    render(<Trial />);
    const dialog = await open();
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(document.activeElement).toBe(dialog);
  });

  it("confirms and closes, or waits for a promise and stays open if it rejects", async () => {
    let fail: (() => void) | undefined;
    const onConfirm = vi
      .fn<() => void | Promise<void>>()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            fail = () => {
              reject(new Error("Card declined"));
            };
          }),
      )
      .mockImplementationOnce(() => undefined);
    render(<Trial onConfirm={onConfirm} />);
    await open();
    await userEvent.click(
      screen.getByRole("button", { name: "Start the trial" }),
    );
    expect(
      screen
        .getByRole("button", { name: "Start the trial" })
        .getAttribute("aria-busy"),
    ).toBe("true");
    fail?.();
    await waitFor(() => {
      expect(
        screen
          .getByRole("button", { name: "Start the trial" })
          .hasAttribute("aria-busy"),
      ).toBe(false);
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Start the trial" }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("stays open while its confirm is pending, whatever asks it to close", async () => {
    let finish: (() => void) | undefined;
    render(
      <Trial
        onConfirm={() =>
          new Promise((resolve) => {
            finish = resolve;
          })
        }
      />,
    );
    await open();
    await userEvent.click(
      screen.getByRole("button", { name: "Start the trial" }),
    );
    await userEvent.keyboard("{Escape}");
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("dialog")).toBeTruthy();
    finish?.();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
