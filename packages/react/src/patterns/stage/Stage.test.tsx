import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent as browser } from "vitest/browser";
import { Stage } from "./Stage.tsx";
import type { StageSize } from "./Stage.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

function canvas(): HTMLElement {
  return screen.getByRole("img", { name: "Card preview" });
}

function Frame({
  size,
  cropping = false,
  onSizeChange,
}: {
  readonly size: StageSize;
  readonly cropping?: boolean;
  readonly onSizeChange?: (size: StageSize) => void;
}): ReactElement {
  return (
    <div style={{ inlineSize: "400px", blockSize: "360px", display: "grid" }}>
      <Stage
        label="Card preview"
        size={size}
        background="linear-gradient(135deg, #c7d2fe, #f5d0fe)"
        cropping={cropping}
        onSizeChange={onSizeChange}
      >
        <p>Launch card</p>
      </Stage>
    </div>
  );
}

describe("Stage", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    const canvasRef = createRef<HTMLDivElement>();
    render(
      <Stage
        ref={ref}
        canvasRef={canvasRef}
        label="Card preview"
        size={{ width: 1600, height: 900 }}
        className="custom"
        data-testid="stage"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("Stage");
    expect(ref.current?.className).toBe("bt-stage custom");
    expect(ref.current?.dataset["testid"]).toBe("stage");
    expect(canvasRef.current).toBe(canvas());
  });

  it("draws the largest canvas of its shape that fits 32px inside, with artwork free to overlap", async () => {
    render(<Frame size={{ width: 1600, height: 900 }} />);
    await settled();
    const box = canvas().getBoundingClientRect();
    expect(Math.round(box.width)).toBe(336);
    expect(Math.round(box.height)).toBe(189);
    expect(
      canvas()
        .querySelector('[data-bt-part="artwork"]')
        ?.hasAttribute("data-bt-allow-overlap"),
    ).toBe(true);
    expect(getComputedStyle(canvas()).borderRadius).toBe("12px");
  });

  it("reshapes when its size changes, staying centered", async () => {
    const { rerender } = render(<Frame size={{ width: 1600, height: 900 }} />);
    await settled();
    rerender(<Frame size={{ width: 900, height: 1600 }} />);
    await waitFor(() => {
      expect(Math.round(canvas().getBoundingClientRect().height)).toBe(296);
    });
    await settled();
    const box = canvas().getBoundingClientRect();
    expect(Math.round(box.width)).toBe(Math.round((296 * 900) / 1600));
    const stage = canvas().parentElement?.getBoundingClientRect();
    expect(
      Math.abs(
        box.left +
          box.width / 2 -
          ((stage?.left ?? 0) + (stage?.width ?? 0) / 2),
      ),
    ).toBeLessThanOrEqual(1);
  });

  it("fades its background and shows eight handles in crop mode", async () => {
    render(<Frame size={{ width: 1600, height: 900 }} cropping />);
    await waitFor(() => {
      const background = canvas().querySelector<HTMLElement>(
        '[data-bt-part="background"]',
      );
      expect(background && getComputedStyle(background).opacity).toBe("0");
    });
    expect(canvas().querySelectorAll('[data-bt-part="handle"]')).toHaveLength(
      8,
    );
  });

  it("resizes from a handle, its opposite edge mirroring the one held", async () => {
    function Cropping({
      onSizeChange,
    }: {
      readonly onSizeChange: (size: StageSize) => void;
    }): ReactElement {
      const [size, setSize] = useState<StageSize>({ width: 1600, height: 900 });
      return (
        <Frame
          size={size}
          cropping
          onSizeChange={(next) => {
            onSizeChange(next);
            setSize(next);
          }}
        />
      );
    }
    const onSizeChange = vi.fn();
    render(<Cropping onSizeChange={onSizeChange} />);
    await settled();
    const scale = canvas().offsetWidth / 1600;
    const handle = canvas().querySelector<HTMLElement>(
      '[data-handle="e"] [data-bt-part="hit"]',
    );
    if (!handle) throw new Error("No hit area.");
    await browser.dragAndDrop(handle, canvas(), {
      sourcePosition: { x: 12, y: 12 },
      targetPosition: { x: canvas().offsetWidth - 10, y: 20 },
    });
    await waitFor(() => {
      expect(onSizeChange).toHaveBeenCalled();
    });
    const last = onSizeChange.mock.lastCall?.[0] as StageSize;
    expect(last.height).toBe(900);
    expect(last.width).toBeLessThan(1600);
    expect(
      Math.abs(last.width - (1600 - (2 * 10) / scale)),
    ).toBeLessThanOrEqual(4 / scale);
  });
});
