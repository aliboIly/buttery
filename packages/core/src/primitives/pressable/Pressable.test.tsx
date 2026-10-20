import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Surface } from "../surface/Surface.tsx";
import { Pressable } from "./Pressable.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Pressable", () => {
  it("is a button that never submits by accident", async () => {
    const onClick = vi.fn();
    const onSubmit = vi.fn();
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Pressable onClick={onClick}>Open</Pressable>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Open" });
    expect(button.getAttribute("type")).toBe("button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("works from the keyboard", async () => {
    const onClick = vi.fn();
    render(<Pressable onClick={onClick}>Open</Pressable>);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("carries the press and focus recipes onto its child with asChild", () => {
    render(
      <Pressable asChild className="custom">
        <a href="#card">Card</a>
      </Pressable>,
    );
    const link = screen.getByRole("link", { name: "Card" });
    expect(link.className).toBe("bt-pressable bt-press bt-focus custom");
    expect(link.dataset["bt"]).toBe("Pressable");
    expect(link.hasAttribute("type")).toBe(false);
  });

  it("makes a link press like a button: a box that scales, no underline, the text color around it", () => {
    render(
      <div style={{ color: "rgb(30, 40, 50)" }}>
        <Surface asChild level="card" pad={4}>
          <Pressable asChild>
            <a href="#/surface">Spring launch</a>
          </Pressable>
        </Surface>
      </div>,
    );
    const link = screen.getByRole("link", { name: "Spring launch" });
    const style = getComputedStyle(link);
    expect(style.display).toBe("inline-block");
    expect(style.textDecorationLine).toBe("none");
    expect(style.color).toBe("rgb(30, 40, 50)");
    expect(link.getBoundingClientRect().height).toBeGreaterThan(30);
  });

  it("keeps its press easing next to hover feedback", () => {
    render(<Pressable className="bt-hover-tint">Open</Pressable>);
    const properties = getComputedStyle(
      screen.getByRole("button", { name: "Open" }),
    ).transitionProperty.split(", ");
    expect(properties).toEqual(
      expect.arrayContaining(["scale", "background-color", "color"]),
    );
  });

  it('keeps type="button" on a button child', () => {
    render(
      <Pressable asChild>
        <button>Rename</button>
      </Pressable>,
    );
    expect(
      screen.getByRole("button", { name: "Rename" }).getAttribute("type"),
    ).toBe("button");
  });

  it("warns when asChild renders something people can't press", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <>
        <Pressable asChild>
          <a href="#card">Card</a>
        </Pressable>
        <Pressable asChild>
          <div>Spring launch</div>
        </Pressable>
      </>,
    );
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[buttery:Pressable] asChild rendered a <div>, which keyboards and screen readers can't press. Fix:",
      ),
    );
  });

  it("becomes the surface it's placed in, keeping the surface's look", () => {
    render(
      <Surface asChild level="raised" padX={4} padY={2}>
        <Pressable>Export</Pressable>
      </Surface>,
    );
    const button = screen.getByRole("button", { name: "Export" });
    const style = getComputedStyle(button);
    expect(button.classList.contains("bt-surface")).toBe(true);
    expect(style.paddingLeft).toBe("16px");
    expect(style.paddingTop).toBe("8px");
    expect(style.borderTopLeftRadius).toBe("12px");
    expect(style.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.cursor).toBe("pointer");
  });
});
