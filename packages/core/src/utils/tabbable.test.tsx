import { afterEach, describe, expect, it } from "vitest";
import { hasTabbable, tabbables } from "./tabbable.ts";

function holding(html: string): HTMLElement {
  const element = document.createElement("div");
  element.innerHTML = html;
  document.body.append(element);
  return element;
}

afterEach(() => {
  document.body.replaceChildren();
});

describe("hasTabbable", () => {
  it("finds buttons, links, fields and tabindex 0", () => {
    expect(hasTabbable(holding("<button>Go</button>"))).toBe(true);
    expect(hasTabbable(holding('<a href="#top">Top</a>'))).toBe(true);
    expect(hasTabbable(holding("<input />"))).toBe(true);
    expect(hasTabbable(holding('<div tabindex="0">Card</div>'))).toBe(true);
  });

  it("skips text, disabled controls and tabindex -1", () => {
    expect(hasTabbable(holding("<p>Words</p>"))).toBe(false);
    expect(hasTabbable(holding("<button disabled>Go</button>"))).toBe(false);
    expect(hasTabbable(holding('<div tabindex="-1">Panel</div>'))).toBe(false);
    expect(hasTabbable(holding('<a href="#top" tabindex="-1">Top</a>'))).toBe(
      false,
    );
    expect(hasTabbable(null)).toBe(false);
  });

  it("skips what isn't rendered or sits under inert", () => {
    expect(
      hasTabbable(holding('<button style="display: none">Menu</button>')),
    ).toBe(false);
    expect(
      hasTabbable(
        holding('<div style="display: none"><a href="#a">A</a></div>'),
      ),
    ).toBe(false);
    expect(
      hasTabbable(holding('<button style="visibility: hidden">Go</button>')),
    ).toBe(false);
    expect(hasTabbable(holding("<div inert><button>Go</button></div>"))).toBe(
      false,
    );
    expect(
      hasTabbable(
        holding(
          '<span data-radix-focus-guard tabindex="0" style="position: fixed; opacity: 0"></span>',
        ),
      ),
    ).toBe(false);
  });

  it("lists the tab stops in document order", () => {
    const element = holding(
      '<button>One</button><p>Text</p><a href="#two">Two</a><button disabled>Off</button>',
    );
    expect(tabbables(element).map((stop) => stop.textContent)).toEqual([
      "One",
      "Two",
    ]);
    expect(tabbables(null)).toEqual([]);
  });
});
