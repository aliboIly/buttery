import "../styles/index.css";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Sticky } from "../layers/sticky/Sticky.tsx";
import { scrollToSection } from "./scroll-section.ts";

afterEach(cleanup);

function page(): HTMLElement {
  render(
    <div
      data-testid="scroller"
      style={{ blockSize: "300px", overflowY: "auto" }}
    >
      <Sticky>
        <div data-testid="bar" style={{ blockSize: "40px" }}>
          Bar
        </div>
      </Sticky>
      <section id="intro" style={{ blockSize: "400px" }}>
        Intro
      </section>
      <section id="export" style={{ blockSize: "400px" }}>
        Export
      </section>
      <div style={{ blockSize: "400px" }} />
    </div>,
  );
  return screen.getByTestId("scroller");
}

describe("scrollToSection", () => {
  it("brings the section's top to the bottom of the sticky bars and focuses it, leaving the URL alone", () => {
    const scroller = page();
    const hash = window.location.hash;
    expect(scrollToSection("export")).toBe(true);
    const section = document.getElementById("export");
    if (!section) throw new Error("No section.");
    expect(scroller.scrollTop).toBeGreaterThan(0);
    expect(
      Math.round(
        section.getBoundingClientRect().top -
          screen.getByTestId("bar").getBoundingClientRect().bottom,
      ),
    ).toBe(0);
    expect(document.activeElement).toBe(section);
    expect(section.getAttribute("tabindex")).toBe("-1");
    expect(window.location.hash).toBe(hash);
  });

  it("says when there's no section with that id", () => {
    page();
    expect(scrollToSection("missing")).toBe(false);
  });
});
