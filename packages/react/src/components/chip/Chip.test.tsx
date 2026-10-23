import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Chip } from "./Chip.tsx";

afterEach(cleanup);

describe("Chip", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Chip ref={ref} className="custom" aria-describedby="rotation">
        Reset
      </Chip>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Chip");
    expect(ref.current?.getAttribute("aria-describedby")).toBe("rotation");
    expect(ref.current?.className).toBe("bt-chip bt-press bt-focus custom");
  });

  it("is a 20px button with a 24px hit area", () => {
    render(<Chip>Reset</Chip>);
    const chip = screen.getByRole("button", { name: "Reset" });
    expect(chip.getBoundingClientRect().height).toBe(20);
    const hit = chip.querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().height).toBe(24);
  });

  it("reaches 24px across too when its label is a single letter", () => {
    render(<Chip>R</Chip>);
    const hit = screen
      .getByRole("button", { name: "R" })
      .querySelector("[data-bt-hit]");
    expect(hit?.getBoundingClientRect().width).toBeCloseTo(24, 0);
  });

  it("keeps focus after the reset it just did when marked aria-disabled", async () => {
    const reset = vi.fn();
    function Reset(): ReactElement {
      const [rotation, setRotation] = useState(15);
      return (
        <Chip
          aria-disabled={rotation === 0}
          onClick={() => {
            reset();
            setRotation(0);
          }}
        >
          Reset
        </Chip>
      );
    }
    render(<Reset />);
    const chip = screen.getByRole("button", { name: "Reset" });
    await userEvent.click(chip);
    expect(reset).toHaveBeenCalledTimes(1);
    expect(chip.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(chip);
    await userEvent.keyboard("{Enter}");
    expect(reset).toHaveBeenCalledTimes(1);
    expect(getComputedStyle(chip).cursor).toBe("default");
  });

  it("presses until it's disabled", async () => {
    const reset = vi.fn();
    const { rerender } = render(<Chip onClick={reset}>Reset</Chip>);
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(reset).toHaveBeenCalledTimes(1);
    rerender(
      <Chip onClick={reset} disabled>
        Reset
      </Chip>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
