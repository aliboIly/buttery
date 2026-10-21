import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { LogoStrip } from "./LogoStrip.tsx";

afterEach(cleanup);

describe("LogoStrip", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLUListElement>();
    render(
      <LogoStrip
        ref={ref}
        label="Teams"
        className="custom"
        data-testid="marks"
      />,
    );
    expect(ref.current?.dataset["bt"]).toBe("LogoStrip");
    expect(ref.current?.dataset["testid"]).toBe("marks");
    expect(ref.current?.className).toBe("bt-logo-strip custom");
  });

  it("is a list named by its label, each mark fitted into a 120 by 24 box", () => {
    render(
      <LogoStrip label="Teams that make cards with us">
        <LogoStrip.Mark>
          <svg viewBox="0 0 240 48" role="img" aria-label="Tidewater" />
        </LogoStrip.Mark>
        <LogoStrip.Mark>
          <svg viewBox="0 0 48 48" role="img" aria-label="Bramble" />
        </LogoStrip.Mark>
      </LogoStrip>,
    );
    expect(
      screen.getByRole("list", { name: "Teams that make cards with us" }),
    ).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    for (const mark of document.querySelectorAll('[data-bt-part="mark"]')) {
      const box = mark.getBoundingClientRect();
      expect([box.width, box.height]).toEqual([120, 24]);
    }
    expect(screen.getByRole("img", { name: "Tidewater" })).toBeTruthy();
  });
});
