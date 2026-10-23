import "@butteryui/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@butteryui/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FloatingToolbar } from "./FloatingToolbar.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

async function settled(): Promise<void> {
  await waitFor(() => {
    expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(true);
  });
}

function Crop({
  frame,
  open = true,
}: {
  readonly frame: CSSProperties;
  readonly open?: boolean;
}): ReactElement {
  const anchor = useRef<HTMLDivElement>(null);
  return (
    <>
      <div ref={anchor} data-testid="frame" style={frame} />
      <FloatingToolbar
        anchor={anchor}
        label="Canvas size"
        meta="1920 × 1080"
        open={open}
      >
        <FloatingToolbar.Button variant="ghost">Revert</FloatingToolbar.Button>
        <FloatingToolbar.Button>Discard</FloatingToolbar.Button>
        <FloatingToolbar.Button variant="primary">
          Keep size
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </>
  );
}

const CENTERED: CSSProperties = {
  marginBlockStart: "40px",
  marginInline: "auto",
  inlineSize: "200px",
  blockSize: "120px",
};

describe("FloatingToolbar", () => {
  it("stamps its class and data-bt on the toolbar, forwards its ref and spreads props", () => {
    function Stamped(): ReactElement {
      const anchor = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={anchor} />
          <FloatingToolbar
            ref={ref}
            anchor={anchor}
            label="Canvas size"
            className="custom"
            data-testid="bar"
          >
            <FloatingToolbar.Button>Discard</FloatingToolbar.Button>
          </FloatingToolbar>
        </>
      );
    }
    const ref = createRef<HTMLDivElement>();
    render(<Stamped />);
    expect(ref.current?.dataset["bt"]).toBe("FloatingToolbar");
    expect(ref.current?.className).toBe("bt-floating-toolbar custom");
    expect(ref.current?.dataset["testid"]).toBe("bar");
  });

  it("is a named toolbar in the floating layer, 12px under its anchor and centered on it", async () => {
    render(<Crop frame={CENTERED} />);
    const toolbar = screen.getByRole("toolbar", { name: "Canvas size" });
    expect(
      toolbar.closest("[data-bt-layer]")?.getAttribute("data-bt-layer"),
    ).toBe("floating");
    await settled();
    const frame = screen.getByTestId("frame").getBoundingClientRect();
    const box = toolbar.getBoundingClientRect();
    expect(Math.round(box.top - frame.bottom)).toBe(12);
    expect(
      Math.abs(box.left + box.width / 2 - (frame.left + frame.width / 2)),
    ).toBeLessThanOrEqual(1);
    expect(box.height).toBe(48);
    expect(screen.getByText("1920 × 1080")).toBeTruthy();
  });

  it("stays 8px inside the viewport, and goes above its anchor when there's no room below", async () => {
    render(
      <Crop
        frame={{
          marginBlockStart: `${String(window.innerHeight - 70)}px`,
          marginInlineStart: `${String(window.innerWidth - 30)}px`,
          inlineSize: "20px",
          blockSize: "20px",
        }}
      />,
    );
    await settled();
    const frame = screen.getByTestId("frame").getBoundingClientRect();
    const box = screen.getByRole("toolbar").getBoundingClientRect();
    expect(Math.round(window.innerWidth - box.right)).toBe(8);
    expect(Math.round(frame.top - box.bottom)).toBe(12);
  });

  it("stays 8px inside the viewport when its anchor scrolls away above it", async () => {
    render(
      <Crop
        frame={{
          marginBlockStart: "-300px",
          inlineSize: "200px",
          blockSize: "120px",
        }}
      />,
    );
    await settled();
    expect(
      Math.round(screen.getByRole("toolbar").getBoundingClientRect().top),
    ).toBe(8);
  });

  it("takes focus as it opens with focusOnOpen, and gives it back where it came from as it closes", async () => {
    function Editor(): ReactElement {
      const anchor = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            Resize
          </button>
          <div ref={anchor} style={CENTERED} />
          <FloatingToolbar
            anchor={anchor}
            label="Canvas size"
            open={open}
            focusOnOpen
          >
            <FloatingToolbar.Button aria-disabled>
              Revert
            </FloatingToolbar.Button>
            <FloatingToolbar.Button
              onClick={() => {
                setOpen(false);
              }}
            >
              Discard
            </FloatingToolbar.Button>
          </FloatingToolbar>
        </>
      );
    }
    render(<Editor />);
    const resize = screen.getByRole("button", { name: "Resize" });
    resize.focus();
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Discard" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(document.activeElement).toBe(resize);
  });

  it("follows its anchor as it moves", async () => {
    function Moving(): ReactElement {
      const [shift, setShift] = useState(0);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setShift(60);
            }}
          >
            Move
          </button>
          <Crop
            frame={{ ...CENTERED, transform: `translateY(${String(shift)}px)` }}
          />
        </>
      );
    }
    render(<Moving />);
    await settled();
    const before = screen.getByRole("toolbar").getBoundingClientRect().top;
    await userEvent.click(screen.getByRole("button", { name: "Move" }));
    await waitFor(() => {
      expect(
        Math.round(
          screen.getByRole("toolbar").getBoundingClientRect().top - before,
        ),
      ).toBe(60);
    });
  });

  it("is one tab stop, with the arrow keys moving between its buttons", async () => {
    render(<Crop frame={CENTERED} />);
    await settled();
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Revert" }),
    );
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Keep size" }),
    );
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toBe(document.body);
  });

  it("fades out when it's hidden, then leaves", async () => {
    const { rerender } = render(<Crop frame={CENTERED} />);
    await settled();
    rerender(<Crop frame={CENTERED} open={false} />);
    expect(screen.getByRole("toolbar")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByRole("toolbar")).toBeNull();
    });
  });
});
