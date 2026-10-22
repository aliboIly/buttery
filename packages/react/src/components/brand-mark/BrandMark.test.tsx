import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import playgroundFavicon from "../../../../../apps/playground/public/favicon.svg?raw";
import starterFavicon from "../../../../../apps/starter/public/favicon.svg?raw";
import { BrandMark } from "./BrandMark.tsx";

afterEach(cleanup);

function marks(): SVGSVGElement[] {
  return [...document.querySelectorAll<SVGSVGElement>(".bt-brand-mark")];
}

describe("BrandMark", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<SVGSVGElement>();
    render(<BrandMark ref={ref} className="custom" data-testid="mark" />);
    expect(ref.current?.dataset["bt"]).toBe("BrandMark");
    expect(ref.current?.getAttribute("class")).toBe("bt-brand-mark custom");
    expect(ref.current?.dataset["testid"]).toBe("mark");
  });

  it("is hidden from screen readers without a label, and an image named by it with one", () => {
    render(
      <>
        <BrandMark />
        <BrandMark label="buttery" />
      </>,
    );
    const [plain] = marks();
    expect(plain?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("img", { name: "buttery" })).toBeTruthy();
    expect(screen.getAllByRole("img")).toHaveLength(1);
  });

  it("draws at each size in px, 32 by default, with the simpler drawing at 16", () => {
    render(
      <>
        <BrandMark />
        {([16, 24, 64, 128, 512] as const).map((size) => (
          <BrandMark key={size} size={size} />
        ))}
      </>,
    );
    expect(marks().map((mark) => mark.getAttribute("width"))).toEqual([
      "32",
      "16",
      "24",
      "64",
      "128",
      "512",
    ]);
    expect(
      marks()
        .slice(0, 5)
        .map((mark) => mark.getBoundingClientRect().width),
    ).toEqual([32, 16, 24, 64, 128]);
    const [, small, , large] = marks();
    expect(small?.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(small?.querySelector("linearGradient")).toBeNull();
    expect(large?.getAttribute("viewBox")).toBe("0 0 128 128");
    expect(large?.querySelectorAll("linearGradient")).toHaveLength(3);
  });

  it("shrinks to fit a narrower container rather than overflowing it", () => {
    render(
      <div style={{ inlineSize: "var(--bt-w-dialog)" }}>
        <BrandMark size={512} />
      </div>,
    );
    const [mark] = marks();
    const box = mark?.getBoundingClientRect();
    expect(box?.width).toBe(400);
    expect(box?.height).toBe(400);
  });

  it("gives each mark's gradients their own ids, so two marks on a page don't share them", () => {
    render(
      <>
        <BrandMark />
        <BrandMark />
      </>,
    );
    const ids = marks().flatMap((mark) =>
      [...mark.querySelectorAll("[id]")].map((element) => element.id),
    );
    expect(ids).toHaveLength(8);
    expect(new Set(ids).size).toBe(8);
    for (const mark of marks()) {
      for (const face of mark.querySelectorAll("path")) {
        const target = /^url\(#(.+)\)$/.exec(face.getAttribute("fill") ?? "");
        expect(
          target?.[1] && mark.querySelector(`[id="${target[1]}"]`),
        ).toBeTruthy();
      }
    }
  });

  it("paints its faces in the brand colors in both themes", () => {
    for (const theme of ["light", "dark"]) {
      document.documentElement.dataset["btTheme"] = theme;
      render(
        <>
          <BrandMark />
          <BrandMark size={16} />
        </>,
      );
      const [large, small] = marks();
      const stops = [...(large?.querySelectorAll("stop") ?? [])].map(
        (stop) => getComputedStyle(stop).stopColor,
      );
      expect(stops).toHaveLength(6);
      expect(new Set(stops).size).toBe(6);
      expect(stops).not.toContain("rgb(0, 0, 0)");
      const top = small?.querySelector('[data-bt-part="top"]');
      expect(top && getComputedStyle(top).fill).toBe("rgb(255, 244, 214)");
      cleanup();
    }
    delete document.documentElement.dataset["btTheme"];
  });

  it("matches the favicons drawn from it, so pnpm brand:assets has run since the drawing changed", () => {
    render(<BrandMark size={16} />);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("No canvas.");
    const hex = (color: string): string => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return `#${[...context.getImageData(0, 0, 1, 1).data.slice(0, 3)]
        .map((part) => part.toString(16).padStart(2, "0"))
        .join("")}`;
    };
    const faces = [...(marks()[0]?.querySelectorAll("path") ?? [])];
    expect(faces).toHaveLength(3);
    for (const face of faces) {
      const fill = hex(getComputedStyle(face).fill);
      expect(starterFavicon).toContain(
        `d="${face.getAttribute("d") ?? ""}" fill="${fill}" stroke="${fill}"`,
      );
    }
    expect(playgroundFavicon).toBe(starterFavicon);
  });
});
