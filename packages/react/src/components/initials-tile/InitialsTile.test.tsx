import "@butteryui/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { InitialsTile, initialsOf } from "./InitialsTile.tsx";
import type { AvatarSize } from "./InitialsTile.tsx";

afterEach(cleanup);

describe("initialsOf", () => {
  it("takes the first letters of the first and last words, in capitals", () => {
    expect(initialsOf("Northside Roasters")).toBe("NR");
    expect(initialsOf("  ana de la cruz ")).toBe("AC");
    expect(initialsOf("Mira")).toBe("M");
    expect(initialsOf("élodie ünal")).toBe("ÉÜ");
    expect(initialsOf("")).toBe("");
  });
});

describe("InitialsTile", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <InitialsTile
        ref={ref}
        name="Northside Roasters"
        className="custom"
        data-testid="tile"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("InitialsTile");
    expect(ref.current?.dataset["testid"]).toBe("tile");
    expect(ref.current?.className).toBe("bt-initials-tile custom");
    expect(ref.current?.textContent).toBe("NR");
  });

  it("is decorative without a label, and an image named by its label with one", () => {
    render(
      <>
        <InitialsTile name="Northside Roasters" data-testid="quiet" />
        <InitialsTile name="Harbor Beans" label="Harbor Beans" />
      </>,
    );
    expect(screen.getByTestId("quiet").getAttribute("aria-hidden")).toBe(
      "true",
    );
    expect(screen.getByRole("img", { name: "Harbor Beans" })).toBeTruthy();
  });

  it("is a square at each size, rounder from md", () => {
    const sizes: readonly [AvatarSize, number, string][] = [
      ["xs", 20, "6px"],
      ["sm", 24, "6px"],
      ["md", 32, "8px"],
      ["lg", 40, "8px"],
    ];
    for (const [size, px, radius] of sizes) {
      render(<InitialsTile name="Northside" size={size} data-testid={size} />);
      const box = screen.getByTestId(size).getBoundingClientRect();
      expect([box.width, box.height]).toEqual([px, px]);
      expect(getComputedStyle(screen.getByTestId(size)).borderRadius).toBe(
        radius,
      );
    }
  });
});
