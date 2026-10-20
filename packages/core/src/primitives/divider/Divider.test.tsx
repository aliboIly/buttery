import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Inline } from "../inline/Inline.tsx";
import { Divider } from "./Divider.tsx";

afterEach(cleanup);

describe("Divider", () => {
  it("is announced as a separator with its orientation", () => {
    render(<Divider orientation="vertical" />);
    const divider = screen.getByRole("separator");
    expect(divider.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("is hidden from assistive technology when decorative", () => {
    render(<Divider decorative data-testid="line" />);
    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.getByTestId("line").getAttribute("role")).toBe("none");
  });

  it("draws a 1px line and takes its length from the spacing scale", () => {
    render(
      <Inline style={{ blockSize: "56px" }}>
        <Divider orientation="vertical" length={6} data-testid="short" />
        <Divider orientation="vertical" data-testid="full" />
      </Inline>,
    );
    const short = screen.getByTestId("short").getBoundingClientRect();
    expect(short.width).toBe(1);
    expect(short.height).toBe(24);
    expect(screen.getByTestId("full").getBoundingClientRect().height).toBe(56);
  });
});
