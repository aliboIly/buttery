import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Bell } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { NotificationNudge } from "./NotificationNudge.tsx";
import type { NotificationNudgeProps } from "./NotificationNudge.tsx";

const KEY = "buttery:nudge:test-delivery";

beforeEach(() => {
  window.localStorage.removeItem(KEY);
  publishSettled();
});

afterEach(cleanup);

function Bar(props: Partial<NotificationNudgeProps>): ReactElement {
  return (
    <div style={{ display: "flex", gap: "8px", padding: "24px" }}>
      <button type="button">Before</button>
      <NotificationNudge
        title="2 customers asked about delivery"
        description="Reply before Tuesday's roast ships."
        action={{ label: "Read messages", href: "#messages" }}
        {...props}
      >
        <IconButton icon={Bell} label="Notifications" dot />
      </NotificationNudge>
      <button type="button">After</button>
    </div>
  );
}

function bell(): HTMLElement {
  return screen.getByRole("button", { name: "Notifications, new" });
}

describe("NotificationNudge", () => {
  it("stamps data-bt on its panel and forwards its ref there", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<Bar ref={ref} />);
    await waitFor(() => {
      expect(ref.current?.dataset["bt"]).toBe("NotificationNudge");
    });
    expect(ref.current?.closest(".bt-notification-nudge")).not.toBeNull();
  });

  it("opens by itself without taking focus, and announces its title", async () => {
    render(<Bar />);
    const dialog = await screen.findByRole("dialog", {
      name: "2 customers asked about delivery",
    });
    expect(dialog.contains(document.activeElement)).toBe(false);
    expect(bell().getAttribute("aria-expanded")).toBe("true");
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe(
        "2 customers asked about delivery",
      );
    });
  });

  it("waits to open by itself until its button is in view", async () => {
    render(
      <>
        <div style={{ blockSize: "200vh" }} />
        <Bar />
      </>,
    );
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.queryByRole("dialog")).toBeNull();
    bell().scrollIntoView();
    expect(await screen.findByRole("dialog")).toBeTruthy();
    window.scrollTo(0, 0);
  });

  it("waits for a modal dialog to close before it opens by itself", async () => {
    function Page({ modal }: { readonly modal: boolean }): ReactElement {
      return (
        <>
          {modal ? (
            <div role="dialog" aria-modal="true" aria-label="Announcement">
              A dialog
            </div>
          ) : null}
          <Bar />
        </>
      );
    }
    const { rerender } = render(<Page modal />);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(
      screen.queryByRole("dialog", {
        name: "2 customers asked about delivery",
      }),
    ).toBeNull();
    rerender(<Page modal={false} />);
    expect(
      await screen.findByRole("dialog", {
        name: "2 customers asked about delivery",
      }),
    ).toBeTruthy();
  });

  it("takes Tab from its button into it, back with Shift+Tab, and on to what follows the button", async () => {
    render(<Bar />);
    await screen.findByRole("dialog");
    await browser.keyboard("{Shift}");
    bell().focus();
    await browser.keyboard("{Tab}");
    expect(document.activeElement?.textContent).toBe("Read messages");
    await browser.keyboard("{Shift>}{Tab}{/Shift}");
    expect(document.activeElement).toBe(bell());
    screen.getByRole("button", { name: "Later" }).focus();
    await browser.keyboard("{Tab}");
    expect(document.activeElement?.textContent).toBe("After");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes on Later and doesn't open by itself again under its storage key", async () => {
    const onLater = vi.fn();
    render(<Bar storageKey="test-delivery" onLater={onLater} />);
    await userEvent.click(await screen.findByRole("button", { name: "Later" }));
    expect(onLater).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(window.localStorage.getItem(KEY)).toBe("true");
    cleanup();
    render(<Bar storageKey="test-delivery" />);
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(bell());
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("runs its action and closes, as a link styled as a button", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => {
      event.preventDefault();
    });
    render(
      <Bar action={{ label: "Read messages", href: "#messages", onClick }} />,
    );
    const link = await screen.findByRole("link", { name: "Read messages" });
    expect(link.dataset["variant"]).toBe("primary");
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("closes on Escape", async () => {
    render(<Bar />);
    await screen.findByRole("dialog");
    await browser.keyboard("{Shift}");
    bell().focus();
    await browser.keyboard("{Tab}");
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(bell());
  });

  it("starts open with defaultOpen, its classes and style on its body", async () => {
    render(
      <Bar defaultOpen className="nudge" style={{ maxInlineSize: "240px" }} />,
    );
    const body = await waitFor(() => {
      const element = document.querySelector<HTMLElement>(
        '[data-bt="NotificationNudge"]',
      );
      if (!element) throw new Error("Not open yet.");
      return element;
    });
    expect(body.classList.contains("nudge")).toBe(true);
    expect(body.style.maxInlineSize).toBe("240px");
  });
});
