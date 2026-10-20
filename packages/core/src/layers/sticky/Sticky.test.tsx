import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Sticky } from "./Sticky.tsx";

afterEach(cleanup);

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
