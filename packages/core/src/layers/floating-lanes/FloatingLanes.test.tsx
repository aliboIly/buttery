import "../../styles/index.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { FloatingLanes, useFloatingObstacle } from "./FloatingLanes.tsx";

afterEach(cleanup);

function Toast({ children }: { readonly children: string }): ReactElement {
  return (
    <div style={{ blockSize: "36px", inlineSize: "240px" }}>{children}</div>
  );
}

function Toolbar(): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  useFloatingObstacle(ref);
  return (
    <div
      ref={ref}
      data-testid="toolbar"
      style={{
        position: "fixed",
        insetBlockEnd: "16px",
        insetInlineStart: "50%",
        inlineSize: "320px",
        blockSize: "48px",
        transform: "translateX(-50%)",
      }}
    />
  );
}

describe("FloatingLanes", () => {
  it("stacks items 8px apart, 24px above the bottom of the viewport", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
        <FloatingLanes.Item>
          <Toast>Exported</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const first = (
      await screen.findByText("Card deleted")
    ).getBoundingClientRect();
    const second = screen.getByText("Exported").getBoundingClientRect();
    expect(second.top - first.bottom).toBe(8);
    expect(window.innerHeight - second.bottom).toBe(24);
    expect(
      screen
        .getByText("Exported")
        .closest("[data-bt-layer]")
        ?.getAttribute("data-bt-layer"),
    ).toBe("toast");
  });

  it("moves a lane clear of a registered obstacle", async () => {
    render(
      <>
        <FloatingLanes />
        <Toolbar />
        <FloatingLanes.Item>
          <Toast>Card deleted</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const toolbar = screen.getByTestId("toolbar").getBoundingClientRect();
    await waitFor(() => {
      const toast = screen.getByText("Card deleted").getBoundingClientRect();
      expect(toolbar.top - toast.bottom).toBe(8);
    });
  });

  it("puts items in the lane they ask for", async () => {
    render(
      <>
        <FloatingLanes />
        <FloatingLanes.Item lane="top-end">
          <Toast>Update ready</Toast>
        </FloatingLanes.Item>
      </>,
    );
    const notice = (
      await screen.findByText("Update ready")
    ).getBoundingClientRect();
    expect(notice.top).toBe(24);
    expect(window.innerWidth - notice.right).toBe(24);
  });
});
