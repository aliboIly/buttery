import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { BookOpen, Undo2 } from "lucide-react";
import { createRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { IconButton } from "./IconButton.tsx";

afterEach(cleanup);

describe("IconButton", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <IconButton ref={ref} icon={Undo2} label="Undo" className="custom" />,
    );
    expect(ref.current?.dataset["bt"]).toBe("IconButton");
    expect(ref.current?.className).toBe(
      "bt-icon-button bt-press bt-focus custom",
    );
  });

  it("is a button named by its label, 36 or 28px square", () => {
    render(
      <>
        <IconButton icon={Undo2} label="Undo" />
        <IconButton icon={Undo2} label="Close" size="sm" />
      </>,
    );
    const sizes = ["Undo", "Close"].map((name) => {
      const { width, height } = screen
        .getByRole("button", { name })
        .getBoundingClientRect();
      return [width, height];
    });
    expect(sizes).toEqual([
      [36, 36],
      [28, 28],
    ]);
  });

  it("shows its label as a tooltip on keyboard focus", async () => {
    render(<IconButton icon={Undo2} label="Undo" />);
    const button = screen.getByRole("button", { name: "Undo" });
    await userEvent.keyboard("{Shift}");
    button.focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('[data-bt="Tooltip"]')?.textContent).toBe(
      "Undo",
    );
  });

  it("isn't described by its tooltip, which only repeats its name", async () => {
    render(<IconButton icon={Undo2} label="Undo" />);
    const button = screen.getByRole("button", { name: "Undo" });
    await userEvent.keyboard("{Shift}");
    button.focus();
    await waitFor(() => {
      expect(document.querySelector('[data-bt="Tooltip"]')).not.toBeNull();
    });
    expect(button.hasAttribute("aria-describedby")).toBe(false);
  });

  it("shows no tooltip with tooltip off", async () => {
    render(<IconButton icon={Undo2} label="Undo" tooltip={false} />);
    await userEvent.keyboard("{Shift}");
    screen.getByRole("button", { name: "Undo" }).focus();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.querySelector('[data-bt="Tooltip"]')).toBeNull();
  });

  it("keeps a description it was given", () => {
    render(
      <>
        <IconButton icon={Undo2} label="Undo" aria-describedby="hint" />
        <p id="hint">Takes back the last change</p>
      </>,
    );
    expect(
      screen
        .getByRole("button", { name: "Undo" })
        .getAttribute("aria-describedby"),
    ).toBe("hint");
  });

  it("can be a link with asChild", () => {
    render(
      <IconButton asChild icon={BookOpen} label="Guide">
        <a href="#guide" aria-label="Guide" />
      </IconButton>,
    );
    const link = screen.getByRole("link", { name: "Guide" });
    expect(link.dataset["bt"]).toBe("IconButton");
    expect(link.querySelector('[data-bt="Icon"]')).not.toBeNull();
  });

  it("ignores presses while aria-disabled and keeps focus", async () => {
    const onClick = vi.fn();
    render(
      <IconButton icon={Undo2} label="Undo" aria-disabled onClick={onClick} />,
    );
    const button = screen.getByRole("button", { name: "Undo" });
    button.focus();
    await userEvent.keyboard("{Enter}");
    button.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(button);
  });

  it("draws a dot on the icon's top end corner and adds it to the name", () => {
    render(
      <>
        <IconButton icon={BookOpen} label="Notifications" dot />
        <IconButton
          icon={BookOpen}
          label="Updates"
          dot
          dotLabel="unread"
          size="sm"
        />
      </>,
    );
    const button = screen.getByRole("button", { name: "Notifications, new" });
    const dot = button.querySelector('[data-bt-part="dot"]');
    const icon = button.querySelector("svg");
    if (!dot || !icon) throw new Error("No dot or icon.");
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    const mark = dot.getBoundingClientRect();
    const glyph = icon.getBoundingClientRect();
    expect([mark.width, mark.height]).toEqual([8, 8]);
    expect(Math.abs(mark.left + mark.width / 2 - glyph.right)).toBeLessThan(
      0.5,
    );
    expect(Math.abs(mark.top + mark.height / 2 - glyph.top)).toBeLessThan(0.5);
    expect(
      screen.getByRole("button", { name: "Updates, unread" }),
    ).toBeTruthy();
  });

  it("fills itself with the primary color when it's the primary button", () => {
    render(
      <>
        <IconButton
          icon={BookOpen}
          label="Create"
          variant="primary"
          size="sm"
        />
        <PrimaryProbe />
      </>,
    );
    const create = screen.getByRole("button", { name: "Create" });
    const probe = screen.getByTestId("probe");
    expect(getComputedStyle(create).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    expect(getComputedStyle(create).borderRadius).toBe("9999px");
    expect(create.getBoundingClientRect().height).toBe(28);
  });
});

function PrimaryProbe(): ReactElement {
  return (
    <span
      data-testid="probe"
      style={{ backgroundColor: "var(--bt-primary)" }}
    />
  );
}
