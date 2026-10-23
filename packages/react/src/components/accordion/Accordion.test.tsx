import "@buttery/core/styles.css";
import "../../styles.css";
import { publishSettled } from "@buttery/core";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Repeat } from "lucide-react";
import { createRef, useState } from "react";
import type { ReactElement } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { ButteryProvider } from "../../provider/ButteryProvider.tsx";
import { Accordion } from "./Accordion.tsx";
import type { AccordionProps, AccordionVariant } from "./Accordion.tsx";

beforeEach(() => {
  publishSettled();
});

afterEach(cleanup);

const VARIANTS: readonly AccordionVariant[] = [
  "divided",
  "contained",
  "cards",
  "plain",
];

function Shipping(props: Partial<AccordionProps>): ReactElement {
  return (
    <div style={{ inlineSize: "480px" }}>
      <Accordion {...props}>
        <Accordion.Item value="arrival" title="When will my coffee arrive?">
          Most bags arrive in two to four days.
        </Accordion.Item>
        <Accordion.Item value="shipping" title="How much is shipping?">
          <p>Standard shipping is $6.</p>
          <a href="#rates">See every rate</a>
        </Accordion.Item>
        <Accordion.Item value="pickup" title="Can I pick it up?" disabled>
          At the counter, Tuesday to Saturday.
        </Accordion.Item>
        <Accordion.Item value="returns" title="What if I don't like a coffee?">
          Tell us within 30 days.
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

function trigger(name: string): HTMLElement {
  return screen.getByRole("button", { name });
}

function expanded(name: string): string | null {
  return trigger(name).getAttribute("aria-expanded");
}

async function nextFrames(count: number): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
}

/** Keyboard focus as Tab gives it: WebKit's Tab skips buttons, so press a key first, then focus. */
async function keyboardFocus(element: HTMLElement): Promise<void> {
  await userEvent.keyboard("{Shift}");
  element.focus();
}

describe("Accordion", () => {
  it("stamps its class and data-bt, forwards its ref and spreads props", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Accordion ref={ref} aria-label="Shipping" className="custom">
        <Accordion.Item value="a" title="A">
          Answer
        </Accordion.Item>
      </Accordion>,
    );
    expect(ref.current?.dataset["bt"]).toBe("Accordion");
    expect(ref.current?.getAttribute("aria-label")).toBe("Shipping");
    expect(ref.current?.className).toBe("bt-accordion custom");
    expect(ref.current?.dataset["variant"]).toBe("divided");
    expect(ref.current?.dataset["size"]).toBe("md");
  });

  it("puts each trigger in an h3, named by its title and description, its panel a region named by the title", async () => {
    render(
      <Accordion>
        <Accordion.Item
          value="plan"
          icon={Repeat}
          title="Subscription"
          description="2 bags every 2 weeks"
        >
          Your next bag roasts on Thursday.
        </Accordion.Item>
      </Accordion>,
    );
    const button = screen.getByRole("button", {
      name: "Subscription 2 bags every 2 weeks",
    });
    expect(button.closest("h3")).not.toBeNull();
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("region")).toBeNull();
    await userEvent.click(button);
    expect(button.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("region", { name: "Subscription" });
    expect(panel.textContent).toBe("Your next bag roasts on Thursday.");
    expect(button.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("takes its headings' level from headingLevel", () => {
    render(
      <Accordion headingLevel={4}>
        <Accordion.Item value="a" title="Roast dates">
          On every bag.
        </Accordion.Item>
      </Accordion>,
    );
    expect(screen.getByRole("heading", { level: 4 }).textContent).toBe(
      "Roast dates",
    );
  });

  it("keeps one item open at a time, and closes the open one when its trigger is pressed again", async () => {
    render(<Shipping />);
    await userEvent.click(trigger("When will my coffee arrive?"));
    expect(expanded("When will my coffee arrive?")).toBe("true");
    await userEvent.click(trigger("How much is shipping?"));
    expect(expanded("How much is shipping?")).toBe("true");
    expect(expanded("When will my coffee arrive?")).toBe("false");
    await userEvent.click(trigger("How much is shipping?"));
    expect(expanded("How much is shipping?")).toBe("false");
  });

  it("keeps the open item open when collapsible is off", async () => {
    render(<Shipping collapsible={false} defaultValue="arrival" />);
    expect(
      trigger("When will my coffee arrive?").getAttribute("aria-disabled"),
    ).toBe("true");
    await userEvent.click(trigger("When will my coffee arrive?"), {
      force: true,
    });
    expect(expanded("When will my coffee arrive?")).toBe("true");
  });

  it("keeps several items open with type multiple, and can be controlled", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState<readonly string[]>(["returns"]);
      return (
        <>
          <Shipping type="multiple" value={open} onValueChange={setOpen} />
          <output>{open.join(", ")}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(expanded("What if I don't like a coffee?")).toBe("true");
    await userEvent.click(trigger("When will my coffee arrive?"));
    expect(screen.getByRole("status").textContent).toBe("returns, arrival");
    expect(expanded("What if I don't like a coffee?")).toBe("true");
    expect(expanded("When will my coffee arrive?")).toBe("true");
    await userEvent.click(trigger("What if I don't like a coffee?"));
    expect(screen.getByRole("status").textContent).toBe("arrival");
  });

  it("follows a controlled value from outside", async () => {
    function Controlled(): ReactElement {
      const [open, setOpen] = useState("");
      return (
        <>
          <Shipping value={open} onValueChange={setOpen} />
          <button
            type="button"
            onClick={() => {
              setOpen("returns");
            }}
          >
            Open returns
          </button>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(trigger("Open returns"));
    expect(expanded("What if I don't like a coffee?")).toBe("true");
  });

  it("moves between triggers with the arrow keys, wrapping and skipping a disabled one, and jumps with Home and End", async () => {
    render(<Shipping />);
    await keyboardFocus(trigger("When will my coffee arrive?"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(trigger("How much is shipping?"));
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(
      trigger("What if I don't like a coffee?"),
    );
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(trigger("When will my coffee arrive?"));
    await userEvent.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(
      trigger("What if I don't like a coffee?"),
    );
    await userEvent.keyboard("{Home}");
    expect(document.activeElement).toBe(trigger("When will my coffee arrive?"));
    await userEvent.keyboard("{End}");
    expect(document.activeElement).toBe(
      trigger("What if I don't like a coffee?"),
    );
  });

  it("opens and closes from Enter and Space, with a ring inside the trigger on a card", async () => {
    render(<Shipping variant="cards" />);
    await keyboardFocus(trigger("How much is shipping?"));
    const ring = getComputedStyle(trigger("How much is shipping?"));
    expect(ring.outlineStyle).toBe("solid");
    expect(ring.outlineOffset).toBe("-2px");
    await userEvent.keyboard("{Enter}");
    expect(expanded("How much is shipping?")).toBe("true");
    await userEvent.keyboard(" ");
    expect(expanded("How much is shipping?")).toBe("false");
  });

  // WebKit leaves links and buttons out of the tab order unless the system's keyboard setting puts them in.
  it.skipIf(!navigator.userAgent.includes("Chrome/"))(
    "goes through an open panel's links on Tab, and leaves a disabled trigger out",
    async () => {
      render(<Shipping defaultValue="shipping" />);
      await keyboardFocus(trigger("How much is shipping?"));
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(
        screen.getByRole("link", { name: "See every rate" }),
      );
      await userEvent.keyboard("{Tab}");
      expect(document.activeElement).toBe(
        trigger("What if I don't like a coffee?"),
      );
    },
  );

  it("keeps a disabled item shut and out of the tab order", async () => {
    render(<Shipping />);
    expect(trigger("Can I pick it up?").matches(":disabled")).toBe(true);
    await userEvent.click(trigger("Can I pick it up?"), { force: true });
    expect(expanded("Can I pick it up?")).toBe("false");
    expect(
      screen.queryByText("At the counter, Tuesday to Saturday."),
    ).toBeNull();
  });

  it("opens to its content's height and turns its chevron over at once with reduced motion", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="always">
        <Shipping />
      </ButteryProvider>,
    );
    const item = trigger("How much is shipping?").closest(
      '[data-bt-part="accordion-item"]',
    );
    const morph = item?.querySelector<HTMLElement>('[data-bt="Morph"]');
    const chevron = item?.querySelector<HTMLElement>(
      '[data-bt-part="accordion-chevron"]',
    );
    if (!morph || !chevron) throw new Error("No panel or chevron.");
    expect(morph.getBoundingClientRect().height).toBe(0);
    await userEvent.click(trigger("How much is shipping?"));
    await nextFrames(2);
    const panel = screen.getByRole("region", { name: "How much is shipping?" });
    expect(morph.getBoundingClientRect().height).toBeGreaterThan(30);
    expect(morph.getBoundingClientRect().height).toBe(
      panel.getBoundingClientRect().height,
    );
    expect(new DOMMatrixReadOnly(getComputedStyle(chevron).transform).a).toBe(
      -1,
    );
  });

  it("grows its panel over several frames with full motion", async () => {
    render(
      <ButteryProvider layoutGuard={false} reducedMotion="never">
        <Shipping />
      </ButteryProvider>,
    );
    const item = trigger("How much is shipping?").closest(
      '[data-bt-part="accordion-item"]',
    );
    const morph = item?.querySelector<HTMLElement>('[data-bt="Morph"]');
    if (!morph) throw new Error("No panel.");
    await userEvent.click(trigger("How much is shipping?"));
    await nextFrames(3);
    const growing = morph.getBoundingClientRect().height;
    await waitFor(() => {
      expect(document.documentElement.hasAttribute("data-bt-settled")).toBe(
        true,
      );
    });
    const open = morph.getBoundingClientRect().height;
    expect(growing).toBeGreaterThan(0);
    expect(growing).toBeLessThan(open);
  });

  it("draws each variant's rows: hairlines, one card, a card each or tinted rows", () => {
    const looks: Record<
      AccordionVariant,
      (root: HTMLElement, items: readonly HTMLElement[]) => void
    > = {
      divided: (root, [first, second]) => {
        expect(getComputedStyle(root).boxShadow).toBe("none");
        expect(second?.getBoundingClientRect().top).toBe(
          first?.getBoundingClientRect().bottom,
        );
        expect(getComputedStyle(second ?? root).borderTopWidth).toBe("1px");
        expect(getComputedStyle(first ?? root).borderTopWidth).toBe("0px");
        const title = first?.querySelector('[data-bt-part="accordion-title"]');
        expect(title?.getBoundingClientRect().left).toBe(
          root.getBoundingClientRect().left,
        );
      },
      contained: (root, [first, second]) => {
        expect(getComputedStyle(root).borderTopLeftRadius).toBe("12px");
        expect(getComputedStyle(root).boxShadow).not.toBe("none");
        expect(getComputedStyle(second ?? root).borderTopWidth).toBe("1px");
        const title = first?.querySelector('[data-bt-part="accordion-title"]');
        expect(
          (title?.getBoundingClientRect().left ?? 0) -
            root.getBoundingClientRect().left,
        ).toBe(16);
      },
      cards: (root, [first, second]) => {
        expect(getComputedStyle(root).boxShadow).toBe("none");
        expect(getComputedStyle(first ?? root).borderTopLeftRadius).toBe(
          "12px",
        );
        expect(getComputedStyle(first ?? root).boxShadow).not.toBe("none");
        expect(
          (second?.getBoundingClientRect().top ?? 0) -
            (first?.getBoundingClientRect().bottom ?? 0),
        ).toBe(8);
      },
      plain: (root, [first, second]) => {
        expect(getComputedStyle(root).boxShadow).toBe("none");
        expect(getComputedStyle(second ?? root).borderTopWidth).toBe("0px");
        expect(
          (second?.getBoundingClientRect().top ?? 0) -
            (first?.getBoundingClientRect().bottom ?? 0),
        ).toBe(2);
        const title = first?.querySelector('[data-bt-part="accordion-title"]');
        expect(
          (title?.getBoundingClientRect().left ?? 0) -
            root.getBoundingClientRect().left,
        ).toBe(12);
      },
    };
    for (const variant of VARIANTS) {
      const check = looks[variant];
      const { unmount } = render(<Shipping variant={variant} />);
      const root = document.querySelector<HTMLElement>('[data-bt="Accordion"]');
      if (!root) throw new Error("No accordion.");
      check(root, [
        ...root.querySelectorAll<HTMLElement>(
          ':scope > [data-bt-part="accordion-item"]',
        ),
      ]);
      unmount();
    }
  });

  it("sets each size's title and room", () => {
    for (const [size, font, room] of [
      ["sm", "14px", 12],
      ["md", "15px", 16],
      ["lg", "18px", 20],
    ] as const) {
      const { unmount } = render(<Shipping size={size} />);
      const button = trigger("How much is shipping?");
      const title = button.querySelector<HTMLElement>(
        '[data-bt-part="accordion-title"]',
      );
      expect(title && getComputedStyle(title).fontSize).toBe(font);
      expect(
        (title?.getBoundingClientRect().top ?? 0) -
          button.getBoundingClientRect().top,
      ).toBe(room);
      unmount();
    }
  });

  it("sets an icon and the chevron on the middle of the title's first line, however many lines it wraps to", () => {
    render(
      <div style={{ inlineSize: "240px" }}>
        <Accordion>
          <Accordion.Item
            value="plan"
            icon={Repeat}
            title="Can I change how often my subscription delivers?"
          >
            Yes.
          </Accordion.Item>
        </Accordion>
      </div>,
    );
    const button = screen.getByRole("button");
    const title = button.querySelector<HTMLElement>(
      '[data-bt-part="accordion-title"]',
    );
    const icon = button.querySelector<SVGElement>(
      '[data-bt-part="accordion-leading"] svg',
    );
    const chevron = button.querySelector<SVGElement>(
      '[data-bt-part="accordion-chevron"] svg',
    );
    if (!title || !icon || !chevron) throw new Error("Missing a part.");
    const box = title.getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(40);
    const firstLine = box.top + 10;
    for (const mark of [icon, chevron]) {
      const { top, height } = mark.getBoundingClientRect();
      expect(Math.abs(top + height / 2 - firstLine)).toBeLessThanOrEqual(0.5);
    }
  });

  it("keeps an item with an id clear of sticky bars when it's scrolled to", () => {
    render(
      <div data-testid="under-bars">
        <Accordion>
          <Accordion.Item id="shipping" value="shipping" title="Shipping">
            $6.
          </Accordion.Item>
        </Accordion>
      </div>,
    );
    screen
      .getByTestId("under-bars")
      .style.setProperty("--bt-sticky-top", "64px");
    const item = document.getElementById("shipping");
    expect(item && getComputedStyle(item).scrollMarginTop).toBe("64px");
  });

  it("says how to fix an item outside an accordion", () => {
    expect(() =>
      render(
        <Accordion.Item value="a" title="Alone">
          Nothing
        </Accordion.Item>,
      ),
    ).toThrow(/has to be inside <Accordion>/);
  });
});
