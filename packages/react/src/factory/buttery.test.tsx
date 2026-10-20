import "@buttery/core/styles.css";
import "../styles.css";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { MotionPreferenceContext, Surface } from "@buttery/core";
import { buttery } from "./buttery.tsx";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function ThirdPartyCard({
  heading,
  ...rest
}: ComponentPropsWithRef<"article"> & {
  readonly heading: string;
}): ReactElement {
  return (
    <article {...rest}>
      <h3>{heading}</h3>
    </article>
  );
}

const ButteryCard = buttery(ThirdPartyCard, { surface: "raised", pad: 4 });

describe("buttery", () => {
  it("turns an element into a surface laid out as a stack, with its ref and props", () => {
    const ref = createRef<HTMLElement>();
    render(
      <buttery.section
        ref={ref}
        surface="card"
        pad={4}
        stack
        gap={3}
        aria-label="Backdrop"
        className="custom"
      >
        <span>Fill</span>
        <span>Hues</span>
      </buttery.section>,
    );
    const section = ref.current;
    if (!section) throw new Error("no ref");
    const style = getComputedStyle(section);
    expect(section.tagName).toBe("SECTION");
    expect(section.dataset["bt"]).toBe("buttery.section");
    expect(section.dataset["level"]).toBe("card");
    expect(section.getAttribute("aria-label")).toBe("Backdrop");
    expect(section.classList.contains("custom")).toBe(true);
    expect(style.flexDirection).toBe("column");
    expect(style.rowGap).toBe("12px");
    expect(style.paddingTop).toBe("16px");
    expect(style.borderTopLeftRadius).toBe("12px");
  });

  it("nests concentric corners inside a surface", () => {
    render(
      <Surface level="section">
        <buttery.div surface="card" radius="auto" data-testid="card" />
      </Surface>,
    );
    expect(
      getComputedStyle(screen.getByTestId("card")).borderTopLeftRadius,
    ).toBe("12px");
  });

  it("pads an element without a layout", () => {
    render(<buttery.div pad={2} data-testid="box" />);
    expect(getComputedStyle(screen.getByTestId("box")).paddingTop).toBe("8px");
  });

  it("wraps a component, with the recipe as defaults that props override", () => {
    render(
      <>
        <ButteryCard heading="Spring launch" data-testid="first" />
        <ButteryCard
          heading="Summer sale"
          surface="card"
          data-testid="second"
        />
      </>,
    );
    expect(screen.getByTestId("first").dataset["level"]).toBe("raised");
    expect(screen.getByTestId("first").dataset["bt"]).toBe(
      "buttery(ThirdPartyCard)",
    );
    expect(getComputedStyle(screen.getByTestId("first")).paddingTop).toBe(
      "16px",
    );
    expect(screen.getByTestId("second").dataset["level"]).toBe("card");
  });

  it("gives press feedback to buttons, never submits by accident, and warns on things people can't press", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <>
        <buttery.button press focus>
          Export
        </buttery.button>
        <buttery.div press>Card</buttery.div>
      </>,
    );
    const button = screen.getByRole("button", { name: "Export" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.className).toBe("bt-press bt-focus");
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        "[buttery:buttery] press on a <div> gives press feedback to something people can't press. Fix:",
      ),
    );
  });

  it("truncates with the full text in the title", () => {
    render(
      <buttery.span truncate data-testid="label">
        Background for the spring launch card
      </buttery.span>,
    );
    const label = screen.getByTestId("label");
    expect(label.title).toBe("Background for the spring launch card");
    expect(label.hasAttribute("data-bt-truncate")).toBe(true);
  });

  it("arrives with a preset, and only fades when motion is reduced", async () => {
    render(
      <>
        <buttery.div enter="rise" data-testid="rise">
          Saved
        </buttery.div>
        <MotionPreferenceContext value="reduced">
          <buttery.div enter="rise" data-testid="reduced">
            Saved
          </buttery.div>
        </MotionPreferenceContext>
      </>,
    );
    const rise = screen.getByTestId("rise");
    expect(new DOMMatrix(getComputedStyle(rise).transform).m42).toBeGreaterThan(
      0,
    );
    expect(getComputedStyle(screen.getByTestId("reduced")).transform).toBe(
      "none",
    );
    await waitFor(() => {
      expect(getComputedStyle(rise).opacity).toBe("1");
    });
  });

  it("still lifts on hover after its entrance leaves a transform behind", async () => {
    render(
      <buttery.div enter="rise" hover="lift" pad={4} data-testid="card">
        Templates
      </buttery.div>,
    );
    const card = screen.getByTestId("card");
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    await userEvent.hover(card);
    await waitFor(() => {
      const box = card.getBoundingClientRect();
      const resting = card.parentElement?.getBoundingClientRect().top ?? 0;
      expect(getComputedStyle(card).translate).not.toBe("none");
      expect(box.top).toBeLessThan(resting);
    });
  });

  it("brings its children in one after another with enter=stagger", async () => {
    render(
      <buttery.ul enter="stagger" stack gap={2}>
        {["one", "two", "three"].map((item) => (
          <li key={item} data-testid={item}>
            {item}
          </li>
        ))}
      </buttery.ul>,
    );
    const opacity = (id: string): number =>
      Number(getComputedStyle(screen.getByTestId(id)).opacity);
    await waitFor(() => {
      expect(opacity("one")).toBeGreaterThan(opacity("three"));
    });
    await waitFor(() => {
      expect(opacity("three")).toBe(1);
    });
  });
});
