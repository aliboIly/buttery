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
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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
    expect(link.querySelector('[data-bt-part="external"]')).not.toBeNull();
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
});
