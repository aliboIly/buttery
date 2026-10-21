import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { BookOpen, Undo2 } from "lucide-react";
import { createRef } from "react";
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
});
