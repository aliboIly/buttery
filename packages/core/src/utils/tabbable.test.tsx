import { afterEach, describe, expect, it } from "vitest";
import { hasTabbable } from "./tabbable.ts";

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
    expect(hasTabbable(null)).toBe(false);
  });
});
