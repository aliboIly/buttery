import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { Center } from "../center/Center.tsx";
import { Surface } from "../surface/Surface.tsx";
import { SharedIndicator } from "./SharedIndicator.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const MODES = ["Plain", "Outline", "Glow"] as const;

function Modes(): ReactElement {
  const [mode, setMode] = useState<(typeof MODES)[number]>("Plain");
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <SharedIndicator.Group>
        {MODES.map((option) => (
          <SharedIndicator key={option} active={option === mode} asChild>
            <button
              type="button"
              style={{ inlineSize: "80px", blockSize: "30px", border: 0 }}
              onClick={() => {
                setMode(option);
              }}
            >
              {option}
            </button>
          </SharedIndicator>
        ))}
      </SharedIndicator.Group>
    </div>
  );
}

function indicator(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    '[data-bt-part="indicator"]',
  );
  if (!element) throw new Error("no indicator");
  return element;
}

describe("SharedIndicator", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <SharedIndicator.Group>
        <SharedIndicator active ref={ref} aria-label="Plain" className="custom">
          Plain
        </SharedIndicator>
      </SharedIndicator.Group>,
    );
    expect(ref.current?.dataset["bt"]).toBe("SharedIndicator");
    expect(ref.current?.getAttribute("aria-label")).toBe("Plain");
    expect(ref.current?.className).toBe("bt-shared-indicator custom");
  });

  it("draws one indicator inside the active item, under its content", () => {
    render(<Modes />);
    const plain = screen.getByRole("button", { name: "Plain" });
    expect(
      document.querySelectorAll('[data-bt-part="indicator"]'),
    ).toHaveLength(1);
    expect(indicator().parentElement).toBe(plain);
    const rect = plain.getBoundingClientRect();
    expect(
      document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      ),
    ).toBe(plain);
  });

  it("draws the indicator inside the element an asChild chain renders", () => {
    render(
      <SharedIndicator.Group>
        <SharedIndicator active asChild>
          <Surface asChild level="app">
            <Center asChild>
              <button type="button">Canvas</button>
            </Center>
          </Surface>
        </SharedIndicator>
        <SharedIndicator active={false} asChild>
          <Center asChild>
            <button type="button">Layers</button>
          </Center>
        </SharedIndicator>
      </SharedIndicator.Group>,
    );
    const canvas = screen.getByRole("button", { name: "Canvas" });
    expect(indicator().parentElement).toBe(canvas);
    expect(canvas.classList).toContain("bt-shared-indicator");
    expect(canvas.classList).toContain("bt-surface");
    expect(canvas.classList).toContain("bt-center");
    expect(screen.getByRole("button", { name: "Layers" }).classList).toContain(
      "bt-center",
    );
  });

  it("slides to the item that becomes active", async () => {
    render(<Modes />);
    const start = indicator().getBoundingClientRect().left;
    await userEvent.click(screen.getByRole("button", { name: "Glow" }));
    const glow = screen.getByRole("button", { name: "Glow" });
    expect(indicator().parentElement).toBe(glow);
    const target = glow.getBoundingClientRect().left;
    await waitFor(() => {
      const left = indicator().getBoundingClientRect().left;
      expect(left).toBeGreaterThan(start);
      expect(left).toBeLessThan(target);
    });
    await waitFor(() => {
      expect(indicator().getBoundingClientRect().left).toBe(target);
    });
  });

  it("jumps to the new item when motion is reduced", async () => {
    render(
      <MotionPreferenceContext value="reduced">
        <Modes />
      </MotionPreferenceContext>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Glow" }));
    const target = screen
      .getByRole("button", { name: "Glow" })
      .getBoundingClientRect().left;
    expect(indicator().style.transform).toBe("");
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(indicator().getBoundingClientRect().left).toBe(target);
  });

  it("says how to fix an item outside a group", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<SharedIndicator active>Plain</SharedIndicator>),
    ).toThrow(
      /\[buttery:SharedIndicator\] SharedIndicator has to be inside a <SharedIndicator\.Group>\. Fix:/,
    );
  });
});
