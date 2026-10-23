import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled, watchFocusHistory } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { Button } from "../button/Button.tsx";
import { Dialog } from "./Dialog.tsx";
import { DeleteFromList } from "./examples/delete-from-list.tsx";
import type { DialogSize } from "./Dialog.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function Confirm({
  size,
  children,
}: {
  readonly size?: DialogSize;
  readonly children?: ReactNode;
}): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Delete card</Button>
      </Dialog.Trigger>
      <Dialog.Content size={size}>
        {children ?? (
          <>
            <Dialog.Text
              title="Delete this card?"
              body="It stays in the trash for 30 days."
            />
            <Dialog.Actions>
              <Dialog.Close asChild>
                <Button variant="soft" size="cta" shape="rounded">
                  Keep it
                </Button>
              </Dialog.Close>
              <Button variant="primary" size="cta" shape="rounded">
                Delete
              </Button>
            </Dialog.Actions>
          </>
        )}
      </Dialog.Content>
    </Dialog>
  );
}

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

async function openConfirm(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
  const dialog = await screen.findByRole("dialog");
  await settled();
  return dialog;
}

describe("Dialog", () => {
  it("lets onCloseAutoFocus send focus on when what opened it is gone, as the list example does", async () => {
    render(<DeleteFromList />);
    await userEvent.click(
      screen.getByRole("button", { name: "Delete Harbor Fog" }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: "Delete" }),
    );
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Delete Ironwood Night" }),
      );
    });
    expect(screen.getByText("2 roasts on the shelf")).toBeTruthy();
  });

  it("stamps its class and data-bt on the dialog, forwards its ref and spreads props", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dialog defaultOpen>
        <Dialog.Content
          ref={ref}
          label="Card details"
          className="custom"
          data-testid="details"
        />
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(ref.current?.dataset["bt"]).toBe("Dialog");
    expect(ref.current?.dataset["testid"]).toBe("details");
    expect(ref.current?.className).toBe("bt-dialog bt-surface custom");
  });

  it("opens from its trigger, named by its title and described by its body, with focus inside", async () => {
    render(<Confirm />);
    const dialog = await openConfirm();
    expect(dialog).toHaveAccessibleName("Delete this card?");
    expect(dialog).toHaveAccessibleDescription(
      "It stays in the trash for 30 days.",
    );
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Keep it" }),
    );
  });

  it("waits in the dialog until it has settled, then focuses its first tab stop when it has no field", async () => {
    render(<Confirm />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
    const dialog = await screen.findByRole("dialog");
    expect(document.activeElement).toBe(dialog);
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Keep it" }),
      );
    });
  });

  it("opens on its first field to type in, past a link in the copy above it", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content label="Add a backup email">
          <Dialog.Body>
            <Dialog.Description>
              We send sign-in codes there. <a href="#why">Why a backup?</a>
            </Dialog.Description>
            <label>
              Backup email
              <input type="email" />
            </label>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAccessibleDescription(
      "We send sign-in codes there. Why a backup?",
    );
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByLabelText("Backup email"),
      );
    });
  });

  it("leaves a closing dialog's fields alone when it closes before it has settled", async () => {
    function Owned({ open }: { readonly open: boolean }): ReactElement {
      return (
        <Dialog open={open} onOpenChange={() => undefined}>
          <Dialog.Content label="Add a backup email">
            <Dialog.Body>
              <label>
                Backup email
                <input type="email" />
              </label>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog>
      );
    }
    const { rerender } = render(<Owned open />);
    const field = screen.getByLabelText("Backup email");
    const focused = vi.fn();
    field.addEventListener("focus", focused);
    rerender(<Owned open={false} />);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(focused).not.toHaveBeenCalled();
  });

  it("closes on Escape and hands focus back to its trigger", async () => {
    render(<Confirm />);
    await openConfirm();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Delete card" }),
    );
  });

  it("closes from its close button, a Dialog.Close and a press outside", async () => {
    render(<Confirm />);
    await openConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await openConfirm();
    await userEvent.click(screen.getByRole("button", { name: "Keep it" }));
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await openConfirm();
    const frame = document.querySelector<HTMLElement>('[data-bt-part="frame"]');
    if (!frame) throw new Error("no frame");
    await page.elementLocator(frame).click({ position: { x: 4, y: 4 } });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows its close button disabled with closeDisabled, and pressing it leaves the dialog open", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content closeDisabled>
          <Dialog.Text title="Saving your card" body="This takes a moment." />
        </Dialog.Content>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    await settled();
    const close = screen.getByRole("button", { name: "Close" });
    expect(close.getAttribute("aria-disabled")).toBe("true");
    await browser.click(close, { force: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("keeps focus inside while it's open", async () => {
    render(<Confirm />);
    const dialog = await openConfirm();
    for (let step = 0; step < 6; step += 1) {
      await userEvent.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("takes its name from label without Dialog.Text, and isn't described without a body, with nothing logged", async () => {
    const error = vi.spyOn(console, "error");
    const warn = vi.spyOn(console, "warn");
    render(
      <Dialog defaultOpen>
        <Dialog.Content label="Share the card">
          <Dialog.Actions>
            <Button>Copy link</Button>
          </Dialog.Actions>
        </Dialog.Content>
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Share the card",
    });
    expect(dialog.hasAttribute("aria-describedby")).toBe(false);
    cleanup();
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Text title="Saved" />
        </Dialog.Content>
      </Dialog>,
    );
    expect(await screen.findByRole("dialog", { name: "Saved" })).toBeTruthy();
    expect(error).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
  });

  it("is described by description when it has no Dialog.Text body", async () => {
    render(
      <Dialog defaultOpen>
        <Dialog.Content
          label="Share the card"
          description="Anyone with the link can see it."
        />
      </Dialog>,
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Share the card",
    });
    expect(dialog).toHaveAccessibleDescription(
      "Anyone with the link can see it.",
    );
  });

  it("warns, with the fix, when it has no name", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    render(
      <Dialog defaultOpen>
        <Dialog.Content />
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(warn).toHaveBeenCalledWith(
      '[buttery:Dialog] A dialog has no name, so screen readers announce it as just "dialog". Fix: put a <Dialog.Text title="…" /> in it, or pass label="…" to Dialog.Content.',
    );
  });

  it("warns, with the fix, when a Dialog.Description sits beside a Dialog.Text body", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Text title="Add a backup email" body="For sign-in codes." />
          <Dialog.Body>
            <Dialog.Description>We never share it.</Dialog.Description>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(warn).toHaveBeenCalledWith(
      "[buttery:Dialog] A dialog has both a Dialog.Text body and a Dialog.Description, and screen readers read only one of them. Fix: put the description in Dialog.Text's body, or move the body into the Dialog.Description.",
    );
  });

  it("warns, with the fix, when a description prop sits beside a Dialog.Text body", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Dialog defaultOpen>
        <Dialog.Content description="We never share it.">
          <Dialog.Text title="Add a backup email" body="For sign-in codes." />
        </Dialog.Content>
      </Dialog>,
    );
    await screen.findByRole("dialog");
    expect(warn).toHaveBeenCalledWith(
      "[buttery:Dialog] A dialog has a Dialog.Text body and a description prop, and screen readers read only one of them. Fix: drop the description prop, or the body.",
    );
  });

  it("is 400, 560 or 880 wide by size, and stays 16px inside a narrow window", async () => {
    await page.viewport(1200, 800);
    for (const [size, width] of [
      ["sm", 400],
      ["md", 560],
      ["lg", 880],
    ] as const) {
      render(<Confirm size={size} />);
      const dialog = await openConfirm();
      expect(dialog.getBoundingClientRect().width).toBe(width);
      cleanup();
    }
    await page.viewport(360, 640);
    render(<Confirm />);
    const dialog = await openConfirm();
    const box = dialog.getBoundingClientRect();
    expect(box.left).toBe(16);
    expect(window.innerWidth - box.right).toBe(16);
  });

  it("stays 16px inside a short window and scrolls inside when its content is taller", async () => {
    await page.viewport(1200, 400);
    render(
      <Confirm>
        <Dialog.Text
          title="Delivery terms"
          body={"Every order ships the morning after it's roasted. ".repeat(40)}
        />
      </Confirm>,
    );
    const dialog = await openConfirm();
    const box = dialog.getBoundingClientRect();
    expect(box.top).toBe(16);
    expect(window.innerHeight - box.bottom).toBe(16);
    const scroll = dialog.querySelector('[data-bt-part="scroll"]');
    expect(scroll?.scrollHeight).toBeGreaterThan(scroll?.clientHeight ?? 0);
  });

  it("fills the window less 16px at size full, and fades in without growing", async () => {
    await page.viewport(1200, 800);
    render(<Confirm size="full" />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
    const dialog = await screen.findByRole("dialog");
    const first = getComputedStyle(dialog);
    expect(Number(first.opacity)).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).isIdentity).toBe(true);
    await settled();
    const box = dialog.getBoundingClientRect();
    expect(box.left).toBe(16);
    expect(box.top).toBe(16);
    expect(window.innerWidth - box.right).toBe(16);
    expect(window.innerHeight - box.bottom).toBe(16);
  });

  it("sets a full-size dialog's close button 32px in from 640px of width, and 24px in under it", async () => {
    await page.viewport(1200, 800);
    render(<Confirm size="full" />);
    const wide = await openConfirm();
    const closeCenter = (dialog: HTMLElement): readonly [number, number] => {
      const box = dialog.getBoundingClientRect();
      const close = screen
        .getByRole("button", { name: "Close" })
        .getBoundingClientRect();
      return [
        close.top + close.height / 2 - box.top,
        box.right - (close.left + close.width / 2),
      ];
    };
    expect(closeCenter(wide)).toEqual([46, 46]);
    cleanup();
    await page.viewport(390, 800);
    render(<Confirm size="full" />);
    expect(closeCenter(await openConfirm())).toEqual([24, 24]);
  });

  it("centers its close button 24px from the top and end edges, with the title clear of it", async () => {
    await page.viewport(1200, 800);
    render(<Confirm />);
    const dialog = await openConfirm();
    const box = dialog.getBoundingClientRect();
    const close = screen
      .getByRole("button", { name: "Close" })
      .getBoundingClientRect();
    expect(close.top + close.height / 2 - box.top).toBe(24);
    expect(box.right - (close.left + close.width / 2)).toBe(24);
    const title = screen.getByText("Delete this card?").getBoundingClientRect();
    expect(title.right).toBeLessThanOrEqual(close.left);
  });

  it("sets its close button on a raised disc over media, whose colors aren't the theme's, and leaves it bare otherwise", async () => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "var(--bt-bg-raised)";
    document.body.append(probe);
    const raised = getComputedStyle(probe).backgroundColor;
    probe.remove();
    render(
      <Confirm>
        <Dialog.Media aria-hidden="true">
          <div style={{ blockSize: "120px" }} />
        </Dialog.Media>
        <Dialog.Text
          title="Plans you can share"
          body="Send a plan with a link."
        />
      </Confirm>,
    );
    await openConfirm();
    expect(
      getComputedStyle(screen.getByRole("button", { name: "Close" }))
        .backgroundColor,
    ).toBe(raised);
    cleanup();
    render(<Confirm />);
    await openConfirm();
    expect(
      getComputedStyle(screen.getByRole("button", { name: "Close" }))
        .backgroundColor,
    ).toBe("rgba(0, 0, 0, 0)");
  });

  it("keeps a full-size dialog's long title clear of its close button once the button moves in", async () => {
    await page.viewport(1200, 800);
    render(
      <Confirm size="full">
        <Dialog.Text title={`Delete this card and ${"i ".repeat(160)}more?`} />
      </Confirm>,
    );
    await openConfirm();
    const close = screen
      .getByRole("button", { name: "Close" })
      .getBoundingClientRect();
    const words = screen.getByText(/^Delete this card and i i/);
    const lines = [...words.getClientRects()];
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines)
      expect(line.right).toBeLessThanOrEqual(close.left);
  });

  it("can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <output>{open ? "open" : "closed"}</output>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <Button>Rename</Button>
            </Dialog.Trigger>
            <Dialog.Content label="Rename the card" />
          </Dialog>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole("button", { name: "Rename" }));
    expect(screen.getByText("open", { selector: "output" })).toBeTruthy();
    await screen.findByRole("dialog");
    await settled();
    await userEvent.keyboard("{Escape}");
    expect(screen.getByText("closed", { selector: "output" })).toBeTruthy();
  });

  it("fades in over dur-fast, growing from 97%", async () => {
    render(<Confirm />);
    await userEvent.click(screen.getByRole("button", { name: "Delete card" }));
    const dialog = await screen.findByRole("dialog");
    const first = getComputedStyle(dialog);
    expect(Number(first.opacity)).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).a).toBeLessThan(1);
    expect(new DOMMatrixReadOnly(first.transform).a).toBeGreaterThanOrEqual(
      0.97,
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(getComputedStyle(dialog).opacity).toBe("1");
  });

  it("hands focus back to what opened it when it has no trigger", async () => {
    function Opener(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            New order
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content label="What kind of order?">
              <Dialog.Body>
                <Button>Retail</Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog>
        </>
      );
    }
    render(<Opener />);
    screen.getByRole("button", { name: "New order" }).focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "What kind of order?" });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "New order" }),
      );
    });
  });

  it("hands focus to where it last was outside when what opened it has gone", async () => {
    onTestFinished(watchFocusHistory());
    function Opener(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button>Orders</Button>
          {open ? null : (
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              What's new
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content label="Roasts plan themselves now">
              <Dialog.Body>
                <Button>Got it</Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog>
        </>
      );
    }
    render(<Opener />);
    screen.getByRole("button", { name: "Orders" }).focus();
    screen.getByRole("button", { name: "What's new" }).focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Roasts plan themselves now" });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Orders" }),
      );
    });
  });

  it("hands focus back where it last was without scrolling to it", async () => {
    onTestFinished(watchFocusHistory());
    function Opener(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button>Orders</Button>
          <div style={{ blockSize: "3000px" }} />
          {open ? null : (
            <Button
              onClick={() => {
                setOpen(true);
              }}
            >
              What's new
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content label="Roasts plan themselves now">
              <Dialog.Body>
                <Button>Got it</Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog>
        </>
      );
    }
    render(<Opener />);
    screen.getByRole("button", { name: "Orders" }).focus();
    const opener = screen.getByRole("button", { name: "What's new" });
    opener.scrollIntoView();
    opener.focus();
    expect(window.scrollY).toBeGreaterThan(1000);
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Roasts plan themselves now" });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Orders" }),
      );
    });
    expect(window.scrollY).toBeGreaterThan(1000);
  });

  it("leaves focus on the page when a press opened it while nothing had focus", async () => {
    onTestFinished(watchFocusHistory());
    function Opener(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <input aria-label="Search orders" />
          <p>Halfmoon Roastery</p>
          <Button
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => {
              setOpen(true);
            }}
          >
            What's new
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Content label="Roasts plan themselves now">
              <Dialog.Body>
                <Button>Got it</Button>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog>
        </>
      );
    }
    render(<Opener />);
    await browser.click(screen.getByRole("textbox", { name: "Search orders" }));
    await browser.click(screen.getByText("Halfmoon Roastery"));
    expect(document.activeElement).toBe(document.body);
    await browser.click(screen.getByRole("button", { name: "What's new" }));
    await screen.findByRole("dialog", { name: "Roasts plan themselves now" });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(document.body);
  });
});
