import "@buttery/core/styles.css";
import "../../styles.css";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { toast, Toaster } from "./Toaster.tsx";
import { getToasts } from "./toaster-store.ts";

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
  vi.restoreAllMocks();
});

function toasts(): HTMLElement[] {
  return [
    ...document.querySelectorAll<HTMLElement>(
      '.bt-toaster > [data-bt-part="list"] > [data-bt-part="toast"]',
    ),
  ];
}

function messages(items: readonly HTMLElement[]): string[] {
  return items.map(
    (item) => item.querySelector('[data-bt-part="message"]')?.textContent ?? "",
  );
}

/** The toasts that are showing, leaving out any on their way out. */
function shown(): string[] {
  return messages(toasts().filter((item) => item.dataset["state"] === "open"));
}

function show(message: string, options?: Parameters<typeof toast>[1]): string {
  let id = "";
  act(() => {
    id = toast(message, options);
  });
  return id;
}

function pillOf(message: HTMLElement): HTMLElement {
  const pill = message.closest<HTMLElement>('[data-bt-part="pill"]');
  if (!pill) throw new Error("The message isn't in a toast's pill.");
  return pill;
}

/** How far the pill sits below its place, in px. */
function riseOf(pill: HTMLElement): number {
  return new DOMMatrixReadOnly(getComputedStyle(pill).transform).m42;
}

function boxOf(element: Element): readonly number[] {
  const rect = element.getBoundingClientRect();
  return [rect.left, rect.top, rect.width, rect.height];
}

/** The pill's rise and its toast's opacity over the first 300ms after it appears. */
async function entranceOf(
  pill: HTMLElement,
): Promise<readonly { readonly rise: number; readonly opacity: number }[]> {
  const item = pill.closest("li");
  if (!item) throw new Error("The pill isn't in a toast.");
  const frames: { readonly rise: number; readonly opacity: number }[] = [];
  const start = performance.now();
  while (performance.now() - start < 300) {
    frames.push({
      rise: riseOf(pill),
      opacity: Number(getComputedStyle(item).opacity),
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return frames;
}

async function pause(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function renderApp(): void {
  render(<ButteryProvider layoutGuard={false} />);
}

const undo = {
  label: "Undo",
  onAction: () => undefined,
  altText: "Undo with Command Z",
};

describe("Toaster", () => {
  it("shows a toast in the bottom-center lane, above dialogs, and reads it out", async () => {
    renderApp();
    show("Card deleted");
    const message = await screen.findByText("Card deleted");
    const item = message.closest("li");
    expect(item?.closest("[data-lane]")?.getAttribute("data-lane")).toBe(
      "bottom-center",
    );
    expect(
      item?.closest("[data-bt-layer]")?.getAttribute("data-bt-layer"),
    ).toBe("toast");
    expect(
      screen.getByRole("region", { name: "Notifications (F8)" }),
    ).toContainElement(item ?? null);
    expect(item?.closest('[data-bt="Toaster"]')?.className).toBe(
      "bt-toaster bt-focus",
    );
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="assertive"]')
          ?.textContent,
      ).toBe("Notification Card deleted");
    });
  });

  it("is a 36px pill in the inverse colors, 24px above the window's bottom edge", async () => {
    renderApp();
    show("Card deleted", { action: undo });
    const pill = pillOf(await screen.findByText("Card deleted"));
    const item = pill.closest("li");
    if (!item) throw new Error("The pill isn't in a toast.");
    await waitFor(() => {
      expect(getComputedStyle(item).opacity).toBe("1");
      expect(riseOf(pill)).toBe(0);
    });
    const rect = pill.getBoundingClientRect();
    expect(rect.height).toBe(36);
    expect(window.innerHeight - rect.bottom).toBe(24);
    expect(boxOf(item)).toEqual(boxOf(pill));
    expect(getComputedStyle(pill).borderTopLeftRadius).toBe("9999px");
    expect(getComputedStyle(pill).backgroundColor).toBe("rgb(26, 26, 26)");
    const action = screen.getByRole("button", { name: "Undo" });
    expect(action.getBoundingClientRect().height).toBeGreaterThanOrEqual(24);
    expect(action.getBoundingClientRect().width).toBeGreaterThanOrEqual(24);
  });

  it("keeps the newest three: a fourth lets the oldest go, and the rest stay 8px apart", async () => {
    renderApp();
    for (const count of [1, 2, 3]) show(`Message ${String(count)}`);
    await waitFor(() => {
      expect(shown()).toEqual(["Message 1", "Message 2", "Message 3"]);
    });
    show("Message 4");
    expect(shown()).toEqual(["Message 2", "Message 3", "Message 4"]);
    const leaving = toasts().find((item) => item.dataset["state"] === "closed");
    expect(leaving?.inert).toBe(true);
    await waitFor(() => {
      expect(messages(toasts())).toEqual([
        "Message 2",
        "Message 3",
        "Message 4",
      ]);
    });
    await waitFor(() => {
      const rects = toasts().map((item) => item.getBoundingClientRect());
      expect(
        rects
          .slice(1)
          .map((rect, index) => rect.top - (rects[index]?.bottom ?? 0)),
      ).toEqual([8, 8]);
    });
  });

  it("never holds more than three, however fast they come", () => {
    renderApp();
    act(() => {
      for (let count = 1; count <= 10; count += 1) {
        toast(`Message ${String(count)}`);
      }
    });
    expect(shown()).toEqual(["Message 8", "Message 9", "Message 10"]);
    expect(getToasts()).toHaveLength(3);
  });

  it("updates a toast with the same id in its place, with its time started over, instead of stacking a copy", async () => {
    renderApp();
    expect(show("Uploading 3 photos", { id: "upload" })).toBe("upload");
    show("Card deleted");
    await waitFor(() => {
      expect(shown()).toEqual(["Uploading 3 photos", "Card deleted"]);
    });
    const upload = toasts()[0];
    show("3 photos uploaded", { id: "upload" });
    expect(messages(toasts())).toEqual(["3 photos uploaded", "Card deleted"]);
    expect(toasts()[0]).toBe(upload);
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="assertive"]')
          ?.textContent,
      ).toBe("Notification 3 photos uploaded");
    });
  });

  it("lets the toast shown or updated longest ago go first", () => {
    renderApp();
    for (const name of ["Card deleted", "Link copied", "Card archived"]) {
      show(name, { id: name });
    }
    show("Card deleted", { id: "Card deleted" });
    show("Card exported");
    expect(shown()).toEqual(["Card deleted", "Card archived", "Card exported"]);
  });

  it("keeps focus on a toast while it's updated", async () => {
    renderApp();
    show("Uploading 3 photos", { id: "upload" });
    await screen.findByText("Uploading 3 photos");
    toasts()[0]?.focus();
    const focused = document.activeElement;
    show("3 photos uploaded", { id: "upload" });
    expect(document.activeElement).toBe(focused);
    expect(messages(toasts())).toEqual(["3 photos uploaded"]);
  });

  it("stays 3s, or 5s with an action, unless told otherwise", () => {
    renderApp();
    show("Card deleted");
    show("Card archived", { action: undo });
    show("Uploading", { duration: Number.POSITIVE_INFINITY });
    expect(getToasts().map(({ duration }) => duration)).toEqual([
      3000,
      5000,
      Number.POSITIVE_INFINITY,
    ]);
  });

  it("leaves when its time is up, but not while the pointer is on it", async () => {
    renderApp();
    show("Saved", { duration: 1000 });
    const item = (await screen.findByText("Saved")).closest("li");
    if (!item) throw new Error("No toast.");
    await userEvent.hover(item);
    await pause(1500);
    expect(shown()).toEqual(["Saved"]);
    await userEvent.unhover(item);
    await waitFor(
      () => {
        expect(toasts()).toEqual([]);
      },
      { timeout: 2000 },
    );
  });

  it("waits while focus is on it: F8 moves focus there, Tab reaches the action and Escape closes it", async () => {
    render(
      <ButteryProvider layoutGuard={false}>
        <button type="button">Delete a card</button>
      </ButteryProvider>,
    );
    const before = screen.getByRole("button", { name: "Delete a card" });
    before.focus();
    const onAction = vi.fn();
    show("Card deleted", { duration: 300, action: { ...undo, onAction } });
    await screen.findByText("Card deleted");
    await userEvent.keyboard("{F8}");
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "Notifications (F8)" }),
    );
    await pause(600);
    expect(shown()).toEqual(["Card deleted"]);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(toasts()[0]);
    await userEvent.keyboard("{Tab}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Undo" }),
    );
    await userEvent.keyboard("{Escape}");
    expect(shown()).toEqual([]);
    expect(document.activeElement).toBe(before);
    expect(onAction).not.toHaveBeenCalled();
  });

  it("gives focus back to where it was when its action closes the last toast", async () => {
    render(
      <ButteryProvider layoutGuard={false}>
        <button type="button">Delete a card</button>
      </ButteryProvider>,
    );
    const before = screen.getByRole("button", { name: "Delete a card" });
    before.focus();
    const onAction = vi.fn();
    show("Card deleted", { action: { ...undo, onAction } });
    await screen.findByText("Card deleted");
    await userEvent.keyboard("{F8}");
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Enter}");
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(before);
  });

  it("closes the newest toast on Escape while the region has focus, and leaves Escape elsewhere alone", async () => {
    render(
      <ButteryProvider layoutGuard={false}>
        <button type="button">Crop</button>
      </ButteryProvider>,
    );
    show("Card deleted");
    show("Link copied");
    await screen.findByText("Link copied");
    screen.getByRole("button", { name: "Crop" }).focus();
    await userEvent.keyboard("{Escape}");
    expect(shown()).toEqual(["Card deleted", "Link copied"]);
    await userEvent.keyboard("{F8}");
    await userEvent.keyboard("{Escape}");
    expect(shown()).toEqual(["Card deleted"]);
  });

  it("runs its action once and closes", async () => {
    renderApp();
    const onAction = vi.fn();
    show("Card deleted", { action: { ...undo, onAction } });
    await userEvent.click(await screen.findByRole("button", { name: "Undo" }));
    expect(onAction).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(toasts()).toEqual([]);
    });
  });

  it("reads the action's alternative after the message, as its own sentence", async () => {
    renderApp();
    show("Card deleted", { action: undo, background: true });
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="polite"]')
          ?.textContent,
      ).toBe("Notification Card deleted. Undo with Command Z");
    });
  });

  it("closes a toast by id, or every toast at once", async () => {
    renderApp();
    const first = show("Card deleted");
    show("Link copied");
    show("Card archived");
    act(() => {
      toast.dismiss(first);
    });
    expect(shown()).toEqual(["Link copied", "Card archived"]);
    act(() => {
      toast.dismiss();
    });
    expect(shown()).toEqual([]);
    await waitFor(() => {
      expect(toasts()).toEqual([]);
    });
  });

  it("hands focus to the region when the focused toast is pushed out", async () => {
    renderApp();
    show("Message 1");
    await screen.findByText("Message 1");
    toasts()[0]?.focus();
    for (const count of [2, 3, 4]) show(`Message ${String(count)}`);
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "Notifications (F8)" }),
    );
  });

  it("takes no room and leaves the region out while there's nothing to show", async () => {
    renderApp();
    expect(
      screen.queryByRole("region", { name: "Notifications (F8)" }),
    ).toBeNull();
    show("Card deleted");
    expect(
      await screen.findByRole("region", { name: "Notifications (F8)" }),
    ).toBeTruthy();
    act(() => {
      toast.dismiss();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole("region", { name: "Notifications (F8)" }),
      ).toBeNull();
    });
  });

  it("stretches a long message across the lane on a phone before truncating it", async () => {
    await page.viewport(390, 844);
    try {
      renderApp();
      show(
        "Exported 12 cards to the Downloads folder as PNG files at twice their size",
      );
      const item = (await screen.findByText(/^Exported 12 cards/)).closest(
        "li",
      );
      if (!item) throw new Error("No toast.");
      expect(window.innerWidth).toBe(390);
      expect(item.getBoundingClientRect().width).toBe(390 - 48);
      const message = item.querySelector<HTMLElement>(
        '[data-bt-part="message"]',
      );
      expect(message && message.scrollWidth > message.clientWidth).toBe(true);
    } finally {
      await page.viewport(414, 896);
    }
  });

  it("rises into place as it fades in", async () => {
    renderApp();
    show("Card deleted");
    const frames = await entranceOf(
      pillOf(await screen.findByText("Card deleted")),
    );
    expect(frames.some(({ rise }) => rise > 0)).toBe(true);
    expect(frames.at(-1)?.rise).toBe(0);
  });

  it("only fades in with reduced motion", async () => {
    render(<ButteryProvider layoutGuard={false} reducedMotion="always" />);
    show("Card deleted");
    const frames = await entranceOf(
      pillOf(await screen.findByText("Card deleted")),
    );
    expect(frames.some(({ opacity }) => opacity < 1)).toBe(true);
    expect(frames.every(({ rise }) => rise === 0)).toBe(true);
  });

  it("works without ButteryProvider when rendered on its own", async () => {
    const { FloatingLanes } = await import("@buttery/core");
    render(
      <>
        <FloatingLanes />
        <Toaster label="Hinweis" regionLabel="Hinweise ({hotkey})" />
      </>,
    );
    show("Karte gelöscht");
    expect(
      await screen.findByRole("region", { name: "Hinweise (F8)" }),
    ).toBeTruthy();
    await waitFor(() => {
      expect(
        document.querySelector('[role="status"][aria-live="assertive"]')
          ?.textContent,
      ).toBe("Hinweis Karte gelöscht");
    });
  });

  it("warns, with the fix, when no Toaster is mounted", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    show("Card deleted");
    await pause(10);
    expect(warn).toHaveBeenCalledWith(
      "[buttery:Toaster] toast() ran with no <Toaster /> mounted, so nothing showed. Fix: wrap the app in <ButteryProvider>, which mounts one, or render <Toaster /> once near the root.",
    );
  });

  it("warns, with the fix, about an action without its alternative, and still shows the button", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderApp();
    show("Card deleted", { action: { ...undo, altText: " " } });
    expect(warn).toHaveBeenCalledWith(
      '[buttery:Toaster] The "Undo" action in a toast has no altText, so screen readers hear the message without a way to act on it. Fix: describe another way to do the same, such as "Undo with Command Z".',
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeTruthy();
  });
});
