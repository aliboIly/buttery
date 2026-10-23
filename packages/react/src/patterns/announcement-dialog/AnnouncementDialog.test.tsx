import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { Button } from "../../components/button/Button.tsx";
import { AnnouncementDialog } from "./AnnouncementDialog.tsx";
import type { AnnouncementDialogProps } from "./AnnouncementDialog.tsx";

const KEY = "buttery:announcement:test-news";

beforeEach(() => {
  window.localStorage.removeItem(KEY);
  publishSettled();
});

afterEach(cleanup);

function News(props: Partial<AnnouncementDialogProps>): ReactElement {
  return (
    <AnnouncementDialog
      trigger={<Button>What's new</Button>}
      title="Roasts plan themselves now"
      sections={[
        { title: "A week ahead", body: "Orders fill next week's roasts." },
        { body: "Roasts you planned by hand stay as they are." },
      ]}
      learnMore={{ label: "How roast planning works", href: "#docs" }}
      media={<div data-testid="media" style={{ blockSize: "200px" }} />}
      {...props}
    />
  );
}

describe("AnnouncementDialog", () => {
  it("stamps data-bt on its content and forwards its ref to the dialog", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<News ref={ref} open className="custom" />);
    await screen.findByRole("dialog");
    expect(
      document.querySelector("[data-bt='AnnouncementDialog']")?.className,
    ).toBe("bt-announcement-dialog custom");
    expect(ref.current?.dataset["size"]).toBe("lg");
  });

  it("is named by its title, with each section's subheading an h3, focus on Got it", async () => {
    render(<News />);
    await userEvent.click(screen.getByRole("button", { name: "What's new" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Roasts plan themselves now",
    });
    expect(
      within(dialog).getByRole("heading", { level: 3, name: "A week ahead" }),
    ).toBeTruthy();
    const done = within(dialog).getByRole("button", { name: "Got it" });
    await waitFor(() => {
      expect(document.activeElement).toBe(done);
    });
    const link = within(dialog).getByRole("link", {
      name: "How roast planning works",
    });
    expect(link.dataset["arrow"]).toBe("forward");
    await userEvent.click(done);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("opens by itself once per storage key, then only from its trigger", async () => {
    render(<News storageKey="test-news" />);
    await userEvent.click(
      within(await screen.findByRole("dialog")).getByRole("button", {
        name: "Got it",
      }),
    );
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(window.localStorage.getItem(KEY)).toBe("true");
    cleanup();
    render(<News storageKey="test-news" />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "What's new" }));
    expect(await screen.findByRole("dialog")).toBeTruthy();
  });

  it("leaves focus off its trigger after it opened by itself, and hands it back after it was opened there", async () => {
    render(<News storageKey="test-news" />);
    await screen.findByRole("dialog");
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Got it" }),
      );
    });
    await browser.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    const trigger = screen.getByRole("button", { name: "What's new" });
    expect(document.activeElement).not.toBe(trigger);
    trigger.focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog");
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("hands focus back to what opened it when the app controls it, storage key and all", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            Read the news
          </Button>
          <News
            trigger={undefined}
            storageKey="test-news"
            open={open}
            onOpenChange={setOpen}
          />
        </>
      );
    }
    render(<Controlled />);
    const opener = screen.getByRole("button", { name: "Read the news" });
    opener.focus();
    await browser.keyboard("{Enter}");
    await screen.findByRole("dialog", { name: "Roasts plan themselves now" });
    await browser.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(opener);
  });

  it("closes from a read-more button whatever key is held", async () => {
    const onClick = vi.fn();
    render(
      <News
        open={undefined}
        defaultOpen
        learnMore={{ label: "How roast planning works", onClick }}
      />,
    );
    await screen.findByRole("dialog");
    await browser.click(
      screen.getByRole("button", { name: "How roast planning works" }),
      { modifiers: ["Alt"] },
    );
    expect(onClick).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("puts the media beside the copy when wide, and above it in a narrow window", async () => {
    await page.viewport(1200, 800);
    render(<News open />);
    await screen.findByRole("dialog");
    const media = (): DOMRect =>
      screen.getByTestId("media").getBoundingClientRect();
    const title = (): DOMRect =>
      screen
        .getByRole("heading", { name: "Roasts plan themselves now" })
        .getBoundingClientRect();
    await waitFor(() => {
      expect(media().left).toBeGreaterThan(title().right);
    });
    await page.viewport(390, 800);
    await waitFor(() => {
      expect(media().bottom).toBeLessThanOrEqual(title().top);
    });
    await page.viewport(1200, 800);
  });

  it("follows a link in the app with a forward arrow and closes, and marks one to another site as external", async () => {
    render(<News defaultOpen />);
    const inApp = await screen.findByRole("link", {
      name: /How roast planning works/,
    });
    expect(inApp.dataset["arrow"]).toBe("forward");
    inApp.addEventListener("click", (event) => {
      event.preventDefault();
    });
    await userEvent.click(inApp);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    cleanup();
    render(
      <News
        defaultOpen
        learnMore={{
          label: "Roast planning, explained",
          href: "https://example.com/roast-planning",
        }}
      />,
    );
    const away = await screen.findByRole("link", {
      name: /Roast planning, explained/,
    });
    expect(away.dataset["arrow"]).toBe("external");
  });

  it("starts open with defaultOpen, its style on its content", async () => {
    render(<News defaultOpen style={{ minBlockSize: "300px" }} />);
    const dialog = await screen.findByRole("dialog");
    expect(
      dialog.querySelector<HTMLElement>('[data-bt="AnnouncementDialog"]')?.style
        .minBlockSize,
    ).toBe("300px");
  });
});
