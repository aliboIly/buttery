import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Inline } from "./Inline.tsx";

afterEach(cleanup);

describe("Inline", () => {
  it("lays children out in a centered row with a gap from the scale", () => {
    render(<Inline gap={2} data-testid="row" />);
    const style = getComputedStyle(screen.getByTestId("row"));
    expect(style.flexDirection).toBe("row");
    expect(style.alignItems).toBe("center");
    expect(style.columnGap).toBe("8px");
    expect(style.flexWrap).toBe("nowrap");
  });

  it("gives every child the same width when uniform", () => {
    render(
      <div style={{ inlineSize: "308px" }}>
        <Inline gap={2} uniform>
          <button type="button">Previous</button>
          <button type="button">Finish the tour</button>
        </Inline>
      </div>,
    );
    const [back, forward] = screen.getAllByRole("button");
    expect(back?.getBoundingClientRect().width).toBe(150);
    expect(forward?.getBoundingClientRect().width).toBe(150);
  });

  it("only wraps when asked to", () => {
    render(<Inline wrap data-testid="row" />);
    expect(getComputedStyle(screen.getByTestId("row")).flexWrap).toBe("wrap");
  });
});
