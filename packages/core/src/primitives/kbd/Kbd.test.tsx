import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Kbd, ariaKeyShortcuts, shortcutKeys } from "./Kbd.tsx";

const browserAgent = navigator.userAgent;

function pretendAgent(agent: string): void {
  Object.defineProperty(navigator, "userAgent", {
    value: agent,
    configurable: true,
  });
}

afterEach(() => {
  cleanup();
  pretendAgent(browserAgent);
});

describe("Kbd", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd ref={ref} className="custom" title="Close">
        Esc
      </Kbd>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Kbd");
    expect(ref.current?.getAttribute("title")).toBe("Close");
    expect(ref.current?.className).toBe("bt-kbd custom");
  });

  it("draws each key as its own 20px cap", () => {
    render(<Kbd keys={["shift", "K"]} data-testid="shortcut" />);
    const caps = screen
      .getByTestId("shortcut")
      .querySelectorAll('kbd[data-bt-part="key"]');
    expect(caps).toHaveLength(2);
    expect(caps[1]?.getBoundingClientRect().height).toBe(20);
  });

  it("shows mod as ⌘ on Apple platforms and names it for screen readers", () => {
    pretendAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 15_0)");
    render(<Kbd keys={["mod", "Z"]} data-testid="shortcut" />);
    const shortcut = screen.getByTestId("shortcut");
    expect(shortcut.querySelector('[aria-hidden="true"]')?.textContent).toBe(
      "⌘",
    );
    expect(shortcut.textContent).toContain("Command");
  });

  it("shows mod as Ctrl elsewhere", () => {
    pretendAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    render(<Kbd keys={["mod", "Z"]} data-testid="shortcut" />);
    const caps = screen
      .getByTestId("shortcut")
      .querySelectorAll('kbd[data-bt-part="key"]');
    expect([...caps].map((cap) => cap.textContent)).toEqual(["Ctrl", "Z"]);
  });
});

describe("shortcutKeys", () => {
  it("turns a useShortcut combination into caps, modifiers first", () => {
    expect(shortcutKeys("n")).toEqual(["N"]);
    expect(shortcutKeys("mod+shift+z")).toEqual(["mod", "shift", "Z"]);
    expect(shortcutKeys("cmd+enter")).toEqual(["mod", "enter"]);
    expect(shortcutKeys("alt+up")).toEqual(["alt", "up"]);
    expect(shortcutKeys("space")).toEqual(["space"]);
    expect(shortcutKeys("/")).toEqual(["/"]);
  });
});

describe("ariaKeyShortcuts", () => {
  it("writes a shortcut the way aria-keyshortcuts names keys, per platform", () => {
    expect(ariaKeyShortcuts("n", true)).toBe("N");
    expect(ariaKeyShortcuts("mod+n", true)).toBe("Meta+N");
    expect(ariaKeyShortcuts("mod+n", false)).toBe("Control+N");
    expect(ariaKeyShortcuts("mod+ctrl+k", false)).toBe("Control+K");
    expect(ariaKeyShortcuts("shift+alt+escape", true)).toBe("Alt+Shift+Escape");
    expect(ariaKeyShortcuts("space", false)).toBe("Space");
  });
});
