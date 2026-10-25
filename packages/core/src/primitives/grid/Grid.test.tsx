import "../../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Grid } from "./Grid.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Grid", () => {
  it("splits the width into equal columns", () => {
    render(
      <div style={{ inlineSize: "332px" }}>
        <Grid columns={3} gap={4} data-testid="grid">
          <span data-testid="a">A</span>
          <span data-testid="b">{"long".repeat(40)}</span>
          <span data-testid="c">C</span>
        </Grid>
      </div>,
    );
    for (const id of ["a", "b", "c"]) {
      expect(screen.getByTestId(id).getBoundingClientRect().width).toBe(100);
    }
    expect(getComputedStyle(screen.getByTestId("grid")).columnGap).toBe("16px");
  });

  it("warns when responsive columns have no size container to change with", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <div style={{ containerType: "inline-size" }}>
        <Grid columns={{ base: 1, md: 3 }} />
      </div>,
    );
    expect(warn).not.toHaveBeenCalled();
    render(<Grid columns={{ base: 1, md: 3 }} />);
    expect(warn).toHaveBeenCalledOnce();
    expect(String(warn.mock.calls[0]?.[0])).toContain(
      '[buttery:Grid] columns={{"base":1,"md":3,"lg":3}} can\'t change with the space',
    );
    render(<Grid columns={2} />);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("keeps the caller's style next to its column count", () => {
    render(<Grid columns={2} style={{ opacity: 0.5 }} data-testid="grid" />);
    const grid = screen.getByTestId("grid");
    expect(grid.style.opacity).toBe("0.5");
    expect(grid.style.getPropertyValue("--bt-grid-columns-base")).toBe("2");
  });

  it("changes its columns with its container's width, keeping a size's count for the sizes above", () => {
    for (const [width, columns] of [
      [400, 1],
      [800, 2],
      [1200, 4],
    ] as const) {
      render(
        <div
          style={{
            inlineSize: `${String(width)}px`,
            containerType: "inline-size",
          }}
        >
          <Grid columns={{ base: 1, md: 2, lg: 4 }} data-testid="grid">
            <span>A</span>
          </Grid>
        </div>,
      );
      const tracks = getComputedStyle(screen.getByTestId("grid"))
        .gridTemplateColumns.split(" ")
        .filter((track) => track !== "");
      expect(tracks).toHaveLength(columns);
      cleanup();
    }
    render(
      <div style={{ inlineSize: "1200px", containerType: "inline-size" }}>
        <Grid columns={{ base: 1, md: 3 }} data-testid="grid">
          <span>A</span>
        </Grid>
      </div>,
    );
    expect(
      getComputedStyle(screen.getByTestId("grid"))
        .gridTemplateColumns.split(" ")
        .filter((track) => track !== ""),
    ).toHaveLength(3);
  });
});
