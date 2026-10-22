import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MotionPreferenceContext } from "../../motion/preference.ts";
import { publishSettled } from "../../motion/settle.ts";
import { Morph } from "./Morph.tsx";

const root = document.documentElement;

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

function Panel({
  tall,
  width = 200,
}: {
  readonly tall: boolean;
  readonly width?: number;
}): ReactElement {
  return (
    <div style={{ inlineSize: `${String(width)}px` }}>
      <Morph contentKey={tall ? "tall" : "short"} data-testid="morph">
        <div
          data-testid={tall ? "tall" : "short"}
          style={{ blockSize: tall ? "120px" : "40px" }}
        />
      </Morph>
    </div>
  );
}

function height(): number {
  return screen.getByTestId("morph").getBoundingClientRect().height;
}

async function nextFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

async function measured(value: number): Promise<void> {
  await waitFor(() => {
    expect(height()).toBe(value);
  });
}

describe("Morph", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Morph ref={ref} aria-label="Fill" className="custom">
        Gradient
      </Morph>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Morph");
    expect(ref.current?.getAttribute("aria-label")).toBe("Fill");
    expect(ref.current?.className).toBe("bt-morph custom");
  });

  it("follows swapped content's height with a spring while the content crossfades", async () => {
    const { rerender } = render(<Panel tall={false} />);
    await measured(40);
    rerender(<Panel tall />);
    await nextFrames(2);
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      true,
    );
    expect(height()).toBeLessThan(120);
    expect(screen.getByTestId("short")).toBeTruthy();
    expect(root.hasAttribute("data-bt-settled")).toBe(false);
    await waitFor(() => {
      expect(height()).toBe(120);
      expect(screen.queryByTestId("short")).toBeNull();
      expect(root.hasAttribute("data-bt-settled")).toBe(true);
    });
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("changes height at once when the container is resized", async () => {
    const { rerender } = render(
      <div style={{ inlineSize: "200px" }}>
        <Morph data-testid="morph">
          <p style={{ margin: 0, lineHeight: "20px" }}>
            Every card starts on a blank canvas and grows as you add to it.
          </p>
        </Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeGreaterThan(20);
    });
    const before = height();
    rerender(
      <div style={{ inlineSize: "600px" }}>
        <Morph data-testid="morph">
          <p style={{ margin: 0, lineHeight: "20px" }}>
            Every card starts on a blank canvas and grows as you add to it.
          </p>
        </Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeLessThan(before);
    });
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("follows a size change from outside its content, such as a web font swapping in, at once", async () => {
    render(
      <div data-testid="page" style={{ fontSize: "16px" }}>
        <Morph data-testid="morph">
          <p style={{ margin: 0, fontSize: "1em", lineHeight: "1.25" }}>
            Bags roasted
          </p>
        </Morph>
      </div>,
    );
    await measured(20);
    await nextFrames(3);
    screen.getByTestId("page").style.fontSize = "32px";
    await nextFrames(1);
    expect(height()).toBe(40);
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("follows growth inside a child that renders on its own, its own JSX unchanged", async () => {
    function Details(): ReactElement {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button
            type="button"
            style={{ display: "block", blockSize: "40px" }}
            onClick={() => {
              setOpen((current) => !current);
            }}
          >
            More
          </button>
          {open ? <div style={{ blockSize: "120px" }} /> : null}
        </div>
      );
    }
    const details = <Details />;
    render(<Morph data-testid="morph">{details}</Morph>);
    await measured(40);
    await nextFrames(3);
    screen.getByRole("button", { name: "More" }).click();
    await nextFrames(2);
    expect(height()).toBeGreaterThan(40);
    expect(height()).toBeLessThan(160);
    await measured(160);
  });

  it("doesn't clip content of the same height while it crossfades", async () => {
    const { rerender } = render(
      <Morph contentKey="a" data-testid="morph">
        <div style={{ blockSize: "40px" }}>Before</div>
      </Morph>,
    );
    await measured(40);
    rerender(
      <Morph contentKey="b" data-testid="morph">
        <div style={{ blockSize: "40px" }}>After</div>
      </Morph>,
    );
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      false,
    );
  });

  it("still follows content it rendered bigger with a spring, with no contentKey", async () => {
    const { rerender } = render(
      <Morph data-testid="morph">
        <div style={{ blockSize: "40px" }} />
      </Morph>,
    );
    await measured(40);
    await nextFrames(3);
    rerender(
      <Morph data-testid="morph">
        <div style={{ blockSize: "120px" }} />
      </Morph>,
    );
    await nextFrames(2);
    expect(height()).toBeGreaterThan(40);
    expect(height()).toBeLessThan(120);
    await measured(120);
  });

  it("sits at its natural height between changes, so rewrapped text never spills out", async () => {
    const paragraph = (
      <p style={{ margin: 0, lineHeight: "20px" }}>
        Every card starts on a blank canvas and grows as you add to it.
      </p>
    );
    const { rerender } = render(
      <div style={{ inlineSize: "200px" }}>
        <Morph data-testid="morph">{paragraph}</Morph>
      </div>,
    );
    await waitFor(() => {
      expect(height()).toBeGreaterThan(20);
    });
    rerender(
      <div style={{ inlineSize: "120px" }}>
        <Morph data-testid="morph">{paragraph}</Morph>
      </div>,
    );
    const content = screen
      .getByTestId("morph")
      .querySelector('[data-bt-part="content"]');
    expect(height()).toBe(content?.getBoundingClientRect().height);
    expect(screen.getByTestId("morph").style.height).toBe("auto");
  });

  it("keeps swapped-out content clipped until it has faded, with reduced motion too", async () => {
    function Reduced({ tall }: { readonly tall: boolean }): ReactElement {
      return (
        <MotionPreferenceContext value="reduced">
          <Panel tall={tall} />
        </MotionPreferenceContext>
      );
    }
    const { rerender } = render(<Reduced tall />);
    await measured(120);
    rerender(<Reduced tall={false} />);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByTestId("tall")).toBeTruthy();
    expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
      true,
    );
    await waitFor(() => {
      expect(screen.queryByTestId("tall")).toBeNull();
    });
    await waitFor(() => {
      expect(screen.getByTestId("morph").hasAttribute("data-animating")).toBe(
        false,
      );
    });
  });

  it("jumps to the new height when motion is reduced", async () => {
    function Reduced({ tall }: { readonly tall: boolean }): ReactElement {
      return (
        <MotionPreferenceContext value="reduced">
          <Panel tall={tall} />
        </MotionPreferenceContext>
      );
    }
    const { rerender } = render(<Reduced tall={false} />);
    await measured(40);
    const start = performance.now();
    rerender(<Reduced tall />);
    await waitFor(() => {
      expect(height()).toBe(120);
    });
    expect(performance.now() - start).toBeLessThan(150);
  });

  it("changes height without a ResizeObserver loop for anything observing the page around it", async () => {
    const loops: string[] = [];
    const listen = (event: ErrorEvent): void => {
      if (event.message.includes("ResizeObserver loop"))
        loops.push(event.message);
    };
    window.addEventListener("error", listen);
    const observer = new ResizeObserver(() => undefined);
    const { rerender } = render(
      <div data-testid="page">
        <Panel tall={false} />
      </div>,
    );
    observer.observe(screen.getByTestId("page"));
    await measured(40);
    await nextFrames(3);
    rerender(
      <div data-testid="page">
        <Panel tall />
      </div>,
    );
    await nextFrames(1);
    expect(height()).toBeLessThan(120);
    await measured(120);
    await nextFrames(2);
    observer.disconnect();
    window.removeEventListener("error", listen);
    expect(loops).toEqual([]);
  });

  it("follows a Morph inside it frame by frame while that one moves, without moving on its own", async () => {
    function Nested({ open }: { readonly open: boolean }): ReactElement {
      return (
        <Morph data-testid="outer">
          <p style={{ margin: 0, blockSize: "20px" }}>Roast plan</p>
          <Morph disclosure data-testid="inner">
            {open ? <div style={{ blockSize: "120px" }} /> : null}
          </Morph>
        </Morph>
      );
    }
    const loops: string[] = [];
    const listen = (event: ErrorEvent): void => {
      if (event.message.includes("ResizeObserver loop"))
        loops.push(event.message);
    };
    window.addEventListener("error", listen);
    const { rerender } = render(<Nested open={false} />);
    const outer = screen.getByTestId("outer");
    const inner = screen.getByTestId("inner");
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(20);
    });
    await nextFrames(3);
    rerender(<Nested open />);
    const gaps: number[] = [];
    let innerMoved = false;
    for (let frame = 0; frame < 30; frame += 1) {
      await nextFrames(1);
      const innerHeight = inner.getBoundingClientRect().height;
      if (innerHeight > 0 && innerHeight < 120) innerMoved = true;
      gaps.push(
        Math.abs(outer.getBoundingClientRect().height - (20 + innerHeight)),
      );
      expect(outer.hasAttribute("data-animating")).toBe(false);
    }
    window.removeEventListener("error", listen);
    expect(innerMoved).toBe(true);
    expect(Math.max(...gaps)).toBeLessThan(0.5);
    expect(outer.getBoundingClientRect().height).toBe(140);
    expect(loops).toEqual([]);
  });

  it("lets go of a held height when its motion setting changes mid-hold, so later content still fits", async () => {
    function Toggled({
      reduced,
      tone,
      tall,
    }: {
      readonly reduced: boolean;
      readonly tone: string;
      readonly tall: boolean;
    }): ReactElement {
      return (
        <MotionPreferenceContext value={reduced ? "reduced" : "full"}>
          <Morph data-testid="morph">
            <div
              data-tone={tone}
              style={{ blockSize: tall ? "80px" : "40px" }}
            />
          </Morph>
        </MotionPreferenceContext>
      );
    }
    const { rerender } = render(
      <Toggled reduced={false} tone="a" tall={false} />,
    );
    await measured(40);
    await nextFrames(3);
    rerender(<Toggled reduced={false} tone="b" tall={false} />);
    await Promise.resolve();
    rerender(<Toggled reduced tone="b" tall={false} />);
    await nextFrames(3);
    rerender(<Toggled reduced tone="b" tall />);
    await nextFrames(2);
    expect(height()).toBe(80);
  });

  it("moves on its own again once a Morph inside it unmounts mid-animation", async () => {
    function Nested({
      open,
      inner,
      extra,
    }: {
      readonly open: boolean;
      readonly inner: boolean;
      readonly extra: boolean;
    }): ReactElement {
      return (
        <Morph data-testid="outer">
          <p style={{ margin: 0, blockSize: "20px" }}>Roast plan</p>
          {inner ? (
            <Morph disclosure>
              {open ? <div style={{ blockSize: "120px" }} /> : null}
            </Morph>
          ) : null}
          {extra ? <div style={{ blockSize: "100px" }} /> : null}
        </Morph>
      );
    }
    const { rerender } = render(<Nested open={false} inner extra={false} />);
    const outer = screen.getByTestId("outer");
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(20);
    });
    await nextFrames(3);
    rerender(<Nested open inner extra={false} />);
    await nextFrames(3);
    rerender(<Nested open inner={false} extra={false} />);
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(20);
    });
    await nextFrames(3);
    rerender(<Nested open inner={false} extra />);
    const heights: number[] = [];
    for (let frame = 0; frame < 20; frame += 1) {
      await nextFrames(1);
      heights.push(outer.getBoundingClientRect().height);
    }
    expect(heights.some((value) => value > 20.5 && value < 119.5)).toBe(true);
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(120);
    });
  });

  it("isn't held still by a Morph rendered elsewhere from inside it", async () => {
    function Portaled({ open }: { readonly open: boolean }): ReactElement {
      return (
        <Morph data-testid="outer">
          <p style={{ margin: 0, blockSize: "20px" }}>Roast plan</p>
          {open ? <div style={{ blockSize: "100px" }} /> : null}
          {createPortal(
            <Morph disclosure>
              {open ? <div style={{ blockSize: "60px" }} /> : null}
            </Morph>,
            document.body,
          )}
        </Morph>
      );
    }
    const { rerender } = render(<Portaled open={false} />);
    const outer = screen.getByTestId("outer");
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(20);
    });
    await nextFrames(3);
    rerender(<Portaled open />);
    const heights: number[] = [];
    for (let frame = 0; frame < 20; frame += 1) {
      await nextFrames(1);
      heights.push(outer.getBoundingClientRect().height);
    }
    expect(heights.some((value) => value > 20.5 && value < 119.5)).toBe(true);
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(120);
    });
  });

  it("follows a Morph inside it without a ResizeObserver loop when both change at once", async () => {
    const loops: string[] = [];
    const listen = (event: ErrorEvent): void => {
      if (event.message.includes("ResizeObserver loop"))
        loops.push(event.message);
    };
    window.addEventListener("error", listen);
    const observer = new ResizeObserver(() => undefined);
    function Both({ open }: { readonly open: boolean }): ReactElement {
      return (
        <div data-testid="page">
          <Morph data-testid="outer">
            <p style={{ margin: 0, blockSize: "20px" }}>Roast plan</p>
            {open ? <div style={{ blockSize: "40px" }} /> : null}
            <Morph disclosure>
              {open ? <div style={{ blockSize: "120px" }} /> : null}
            </Morph>
          </Morph>
        </div>
      );
    }
    const { rerender } = render(<Both open={false} />);
    observer.observe(screen.getByTestId("page"));
    const outer = screen.getByTestId("outer");
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(20);
    });
    await nextFrames(3);
    rerender(<Both open />);
    await waitFor(() => {
      expect(outer.getBoundingClientRect().height).toBe(180);
    });
    await nextFrames(2);
    observer.disconnect();
    window.removeEventListener("error", listen);
    expect(loops).toEqual([]);
  });
});
