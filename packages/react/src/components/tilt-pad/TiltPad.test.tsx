import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { page, userEvent as browser } from "vitest/browser";
import { TiltPad } from "./TiltPad.tsx";
import type { TiltValue } from "./TiltPad.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function knob(): HTMLElement {
  const element = document.querySelector<HTMLElement>('[data-bt-part="knob"]');
  if (!element) throw new Error("No knob.");
  return element;
}

function Tilt({
  onValueCommit,
}: {
  readonly onValueCommit?: (value: TiltValue) => void;
}): ReactElement {
  const [tilt, setTilt] = useState<TiltValue>({ x: 0, y: 0 });
  return (
    <>
      <output>{`${String(tilt.x)} ${String(tilt.y)}`}</output>
      <TiltPad
        label="Lean"
        value={tilt}
        onValueChange={setTilt}
        onValueCommit={onValueCommit}
      />
    </>
  );
}

describe("TiltPad", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TiltPad ref={ref} label="Lean" className="custom" data-testid="pad" />,
    );
    expect(ref.current?.dataset["bt"]).toBe("TiltPad");
    expect(ref.current?.className).toBe("bt-tilt-pad custom");
    expect(ref.current?.dataset["testid"]).toBe("pad");
  });

  it("is a named group of two sliders that read out the tilt", async () => {
    render(<TiltPad label="Lean" defaultValue={{ x: 0.3, y: -0.2 }} />);
    expect(screen.getByRole("group", { name: "Lean" })).toBeTruthy();
    await expect
      .element(page.getByRole("slider", { name: "Left and right" }))
      .toHaveAttribute("aria-valuetext", "30% right");
    await expect
      .element(page.getByRole("slider", { name: "Up and down" }))
      .toHaveAttribute("aria-valuetext", "20% up");
  });

  it("tilts with the arrow keys, Shift for bigger steps, and levels with Backspace", async () => {
    const onValueCommit = vi.fn();
    render(<Tilt onValueCommit={onValueCommit} />);
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(screen.getByText("0.2 0")).toBeTruthy();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByText("0.2 -0.1")).toBeTruthy();
    expect(document.activeElement).toBe(
      screen.getByRole("slider", { name: "Up and down" }),
    );
    await userEvent.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(screen.getByText("-0.3 -0.1")).toBeTruthy();
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByText("0 0")).toBeTruthy();
    expect(onValueCommit).toHaveBeenCalledTimes(5);
  });

  it("takes big steps with Page Up and Page Down on the axis last moved, and ignores End", async () => {
    render(<Tilt />);
    await userEvent.tab();
    await userEvent.keyboard("{PageUp}");
    expect(screen.getByText("0.5 0")).toBeTruthy();
    await userEvent.keyboard("{ArrowUp}{PageUp}");
    expect(screen.getByText("0.5 -0.6")).toBeTruthy();
    await userEvent.keyboard("{End}");
    expect(screen.getByText("0.5 -0.6")).toBeTruthy();
  });

  it("counts up as it tilts up, so stepping the up-and-down slider up tilts it up", async () => {
    render(<Tilt />);
    const upDown = screen.getByRole("slider", { name: "Up and down" });
    upDown.focus();
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByText("0 -0.1")).toBeTruthy();
    expect((upDown as HTMLInputElement).value).toBe("10");
  });

  it("is one Tab stop that follows the axis last moved", async () => {
    render(
      <>
        <button type="button">Before</button>
        <Tilt />
        <button type="button">After</button>
      </>,
    );
    screen.getByRole("button", { name: "Before" }).focus();
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      screen.getByRole("slider", { name: "Up and down" }),
    );
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Before" }),
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("slider", { name: "Up and down" }),
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "After" }),
    );
  });

  it("glides the knob on a key step, and keeps buttery unsettled until it lands", async () => {
    render(<Tilt />);
    await userEvent.tab();
    await userEvent.keyboard("{Shift>}{ArrowRight}{/Shift}");
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
      false,
    );
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    expect(
      Number(getComputedStyle(knob()).getPropertyValue("--bt-tilt-pad-x")),
    ).toBeCloseTo(0.5, 3);
  });

  it("commits nothing for a key that changes nothing, such as Home when it's level", async () => {
    const onValueCommit = vi.fn();
    render(<Tilt onValueCommit={onValueCommit} />);
    await userEvent.tab();
    await userEvent.keyboard("{Home}{Backspace}");
    expect(onValueCommit).not.toHaveBeenCalled();
    await userEvent.keyboard("{ArrowRight}");
    expect(onValueCommit).toHaveBeenCalledTimes(1);
  });

  it("never tilts past the edge of its circle", async () => {
    render(<Tilt />);
    await userEvent.tab();
    await userEvent.keyboard(
      "{Shift>}{ArrowRight}{ArrowRight}{ArrowDown}{ArrowDown}{/Shift}",
    );
    const [x = 0, y = 0] = screen
      .getByRole("status")
      .textContent.split(" ")
      .map(Number);
    expect(Math.hypot(x, y)).toBeLessThanOrEqual(1.001);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
  });

  it("follows a drag and commits when it's let go", async () => {
    const onValueCommit = vi.fn();
    render(<Tilt onValueCommit={onValueCommit} />);
    const pad = screen.getByRole("group", { name: "Lean" });
    const { height } = pad.getBoundingClientRect();
    await browser.dragAndDrop(pad, pad, {
      sourcePosition: { x: 4, y: height / 2 },
      targetPosition: { x: 28, y: height / 2 },
    });
    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toBe("0.5 0");
    });
    expect(onValueCommit).toHaveBeenLastCalledWith({ x: 0.5, y: 0 });
    expect(pad.hasAttribute("data-dragging")).toBe(false);
  });

  it("moves its knob toward the tilt and shows the arc on that side", async () => {
    render(<TiltPad label="Lean" defaultValue={{ x: 1, y: 0 }} />);
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    const pad = screen
      .getByRole("group", { name: "Lean" })
      .getBoundingClientRect();
    const box = knob().getBoundingClientRect();
    expect(box.left + box.width / 2 - (pad.left + pad.width / 2)).toBeCloseTo(
      4,
      0,
    );
    const arc = knob().querySelector<HTMLElement>('[data-bt-part="arc"]');
    expect(arc && Number(getComputedStyle(arc).opacity)).toBeCloseTo(1, 2);
    expect(arc && getComputedStyle(arc).backgroundImage).toContain(
      "from 65deg",
    );
  });
});
