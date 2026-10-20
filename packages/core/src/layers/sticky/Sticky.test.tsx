import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sticky } from "./Sticky.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Sticky", () => {
  it("stacks stickies on the same edge and publishes their total height", () => {
    render(
      <div
        data-testid="scroller"
        style={{ overflowY: "auto", blockSize: "300px" }}
      >
        <Sticky>
          <div style={{ blockSize: "64px" }}>Nav</div>
        </Sticky>
        <Sticky data-testid="sub">
          <div style={{ blockSize: "48px" }}>Sub nav</div>
        </Sticky>
        <div style={{ blockSize: "2000px" }} />
      </div>,
    );
    const scroller = screen.getByTestId("scroller");
    expect(scroller.style.getPropertyValue("--bt-sticky-top")).toBe("112px");
    expect(getComputedStyle(screen.getByTestId("sub")).top).toBe("64px");
    scroller.scrollTop = 500;
    const sub = screen.getByTestId("sub").getBoundingClientRect();
    expect(sub.top - scroller.getBoundingClientRect().top).toBe(64);
  });

  it("puts an aside under the bars without counting it", () => {
    render(
      <div
        data-testid="scroller"
        style={{ overflowY: "auto", blockSize: "300px" }}
      >
        <Sticky>
          <div style={{ blockSize: "64px" }}>Nav</div>
        </Sticky>
        <Sticky variant="aside" data-testid="aside">
          <div style={{ blockSize: "240px" }}>Contents</div>
        </Sticky>
        <div style={{ blockSize: "2000px" }} />
      </div>,
    );
    const scroller = screen.getByTestId("scroller");
    expect(scroller.style.getPropertyValue("--bt-sticky-top")).toBe("64px");
    expect(getComputedStyle(screen.getByTestId("aside")).top).toBe("64px");
  });

  it("stacks inside a scroll container that hides its overflow", () => {
    render(
      <div
        data-testid="scroller"
        style={{ overflow: "hidden", blockSize: "300px" }}
      >
        <Sticky>
          <div style={{ blockSize: "48px" }}>Toolbar</div>
        </Sticky>
        <div style={{ blockSize: "2000px" }} />
      </div>,
    );
    expect(
      screen.getByTestId("scroller").style.getPropertyValue("--bt-sticky-top"),
    ).toBe("48px");
  });

  it("warns when a bar is as tall as a sidebar", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <div style={{ overflowY: "auto", blockSize: "300px" }}>
        <Sticky>
          <div style={{ blockSize: "280px" }}>Pages</div>
        </Sticky>
        <div style={{ blockSize: "2000px" }} />
      </div>,
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("[buttery:Sticky] a 280px tall top bar"),
    );
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Fix: <Sticky variant="aside">'),
    );
  });

  it("holds to the bottom edge and cleans up after itself", () => {
    const { unmount } = render(
      <div
        data-testid="scroller"
        style={{ overflowY: "auto", blockSize: "300px" }}
      >
        <div style={{ blockSize: "2000px" }} />
        <Sticky edge="bottom">
          <div style={{ blockSize: "56px" }}>Footer</div>
        </Sticky>
      </div>,
    );
    const scroller = screen.getByTestId("scroller");
    expect(scroller.style.getPropertyValue("--bt-sticky-bottom")).toBe("56px");
    const footer = screen.getByText("Footer").getBoundingClientRect();
    expect(scroller.getBoundingClientRect().bottom - footer.bottom).toBe(0);
    unmount();
    expect(scroller.style.getPropertyValue("--bt-sticky-bottom")).toBe("");
  });
});
