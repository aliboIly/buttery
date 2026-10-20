import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Kbd } from "./Kbd.tsx";

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
