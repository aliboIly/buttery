import "@buttery/core/styles.css";
import "../../styles.css";
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { ArrowLink } from "./ArrowLink.tsx";

afterEach(cleanup);

function stemScale(link: HTMLElement): number {
  const stem = link.querySelector('[data-bt-part="arrow-stem"]');
  if (!stem) throw new Error("The link has no arrow.");
  return Number.parseFloat(getComputedStyle(stem).scale);
}

describe("ArrowLink", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <ArrowLink ref={ref} href="#all" className="custom">
        See all
      </ArrowLink>,
    );
    expect(ref.current?.dataset["bt"]).toBe("ArrowLink");
    expect(ref.current?.getAttribute("href")).toBe("#all");
    expect(ref.current?.className).toBe("bt-arrow-link bt-focus custom");
  });

  it("is a link named by its label, with the arrow after it, or before it going back", () => {
    render(
      <>
        <ArrowLink href="#all">See all</ArrowLink>
        <ArrowLink href="#up" arrow="back">
          Back
        </ArrowLink>
      </>,
    );
    const forward = screen.getByRole("link", { name: "See all" });
    const back = screen.getByRole("link", { name: "Back" });
    expect(forward.lastElementChild?.getAttribute("data-direction")).toBe(
      "forward",
    );
    expect(back.firstElementChild?.getAttribute("data-direction")).toBe("back");
  });

  it("grows its arrow on hover and keeps its width", async () => {
    render(<ArrowLink href="#all">See all</ArrowLink>);
    await document.fonts.ready;
    const link = screen.getByRole("link", { name: "See all" });
    const width = link.getBoundingClientRect().width;
    expect(stemScale(link)).toBe(0);
    await userEvent.hover(link);
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(stemScale(link)).toBe(1);
    expect(link.getBoundingClientRect().width).toBe(width);
  });

  it("keeps the nudged head inside its own box", async () => {
    render(<ArrowLink href="#all">See all</ArrowLink>);
    const link = screen.getByRole("link", { name: "See all" });
    await userEvent.hover(link);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const head = link.querySelector('[data-bt-part="arrow-head"]');
    if (!head) throw new Error("The link has no arrow.");
    expect(head.getBoundingClientRect().right).toBeLessThanOrEqual(
      link.getBoundingClientRect().right + 1,
    );
  });

  it("takes a router's link with asChild", () => {
    function RouterLink({
      to,
      children,
      ...rest
    }: ComponentPropsWithRef<"a"> & { readonly to: string }): ReactElement {
      return (
        <a {...rest} href={`#${to}`}>
          {children}
        </a>
      );
    }
    render(
      <ArrowLink asChild>
        <RouterLink to="/templates">Templates</RouterLink>
      </ArrowLink>,
    );
    const link = screen.getByRole("link", { name: "Templates" });
    expect(link.getAttribute("href")).toBe("#/templates");
    expect(link.dataset["bt"]).toBe("ArrowLink");
    expect(link.lastElementChild?.getAttribute("data-bt-part")).toBe("arrow");
  });
});
