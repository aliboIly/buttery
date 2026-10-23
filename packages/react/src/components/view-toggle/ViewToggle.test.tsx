import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewToggle } from "./ViewToggle.tsx";

afterEach(cleanup);

describe("ViewToggle", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ViewToggle ref={ref} className="custom" data-testid="toggle" />);
    expect(ref.current?.dataset["bt"]).toBe("ViewToggle");
    expect(ref.current?.dataset["testid"]).toBe("toggle");
    expect(ref.current?.className).toContain("bt-view-toggle custom");
  });

  it("is a radio group named View with a grid and a list segment, grid first", async () => {
    const onValueChange = vi.fn();
    render(<ViewToggle onValueChange={onValueChange} />);
    expect(screen.getByRole("radiogroup", { name: "View" })).toBeTruthy();
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(grid.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByRole("radio", { name: "List" }));
    expect(onValueChange).toHaveBeenCalledWith("list");
  });

  it("speaks the words it's given", () => {
    render(
      <ViewToggle
        label="Ansicht"
        labels={{ grid: "Raster", list: "Liste" }}
        defaultValue="list"
      />,
    );
    expect(screen.getByRole("radiogroup", { name: "Ansicht" })).toBeTruthy();
    expect(
      screen.getByRole("radio", { name: "Liste" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(screen.getByRole("radio", { name: "Raster" })).toBeTruthy();
  });
});
