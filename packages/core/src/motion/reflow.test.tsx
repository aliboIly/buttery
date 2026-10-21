import "../styles/index.css";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "./preference.ts";
import { ReflowGroup, useReflow, useReflowDeparture } from "./reflow.tsx";

afterEach(cleanup);

function Tip(): ReactElement | null {
  const [shown, setShown] = useState(true);
  const depart = useReflowDeparture();
  if (!shown) return null;
  return (
    <button
      type="button"
      style={{ display: "block", blockSize: "120px" }}
      onClick={() => {
        setShown(false);
        depart();
      }}
    >
      Dismiss
    </button>
  );
}

function Block(): ReactElement {
  return (
    <motion.section
      {...useReflow()}
      data-testid="block"
      style={{ blockSize: "40px" }}
    >
      Block
    </motion.section>
  );
}

function Page(): ReactElement {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <Tip />
      <Block />
    </div>
  );
}

/** Where the block is drawn, its slide's transform included. */
function blockTop(): number {
  return screen.getByTestId("block").getBoundingClientRect().top;
}

describe("ReflowGroup", () => {
  it("slides the blocks after something that leaves into its place", async () => {
    render(
      <ReflowGroup>
        <Page />
      </ReflowGroup>,
    );
    const before = blockTop();
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    await new Promise((resolve) => requestAnimationFrame(resolve));
    expect(blockTop()).toBeGreaterThan(before - 40);
    await waitFor(
      () => {
        expect(blockTop()).toBeCloseTo(before - 144, 0);
      },
      { timeout: 2000 },
    );
  });

  it("lets blocks jump outside a group and with reduced motion", () => {
    render(<Page />);
    const before = blockTop();
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    expect(blockTop()).toBeCloseTo(before - 144, 0);
    cleanup();
    render(
      <MotionPreferenceContext value="reduced">
        <ReflowGroup>
          <Page />
        </ReflowGroup>
      </MotionPreferenceContext>,
    );
    const reducedBefore = blockTop();
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    expect(blockTop()).toBeCloseTo(reducedBefore - 144, 0);
  });
});
