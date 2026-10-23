import { describe, expect, it } from "vitest";
import {
  DEFAULT_TEXT_SIZE,
  LAYOUT_DEFAULTS,
  LOOK_DEFAULTS,
  SAMPLE_DECK,
  hasStat,
  isDeck,
  lookChanged,
  newSlide,
  nextSlideId,
  placementChanged,
  pointsOf,
  withLayout,
} from "./deck.ts";

const cover = SAMPLE_DECK.slides[0];
if (!cover) throw new Error("The sample deck has no slides.");

describe("the sample deck", () => {
  it("is a whole deck of six slides, one of each layout at least", () => {
    expect(isDeck(SAMPLE_DECK)).toBe(true);
    expect(SAMPLE_DECK.slides).toHaveLength(6);
    expect(new Set(SAMPLE_DECK.slides.map(({ layout }) => layout))).toEqual(
      new Set(["title", "points", "numbers", "quote"]),
    );
  });
});

describe("isDeck", () => {
  it("turns away what storage can hold that isn't a deck", () => {
    expect(isDeck(null)).toBe(false);
    expect(isDeck({ ...SAMPLE_DECK, size: "21:9" })).toBe(false);
    expect(
      isDeck({ ...SAMPLE_DECK, slides: [cover, { ...cover, title: 4 }] }),
    ).toBe(false);
    expect(
      isDeck({
        ...SAMPLE_DECK,
        slides: [{ ...cover, fill: { kind: "solid", preset: "neon" } }],
      }),
    ).toBe(false);
    expect(isDeck({ ...SAMPLE_DECK, slides: [cover, cover] })).toBe(false);
    expect(isDeck({ ...SAMPLE_DECK, slides: [] })).toBe(true);
  });
});

describe("withLayout", () => {
  it("carries the words over and takes the layout's place and direction", () => {
    const moved = withLayout({ ...cover, align: "end" }, "quote");
    expect(moved.layout).toBe("quote");
    expect(moved.title).toBe(cover.title);
    expect(moved.align).toBe(LAYOUT_DEFAULTS.quote.align);
    expect(moved.position).toBe(LAYOUT_DEFAULTS.quote.position);
  });

  it("starts the words a layout needs that the slide doesn't have", () => {
    const numbers = withLayout(cover, "numbers");
    expect(numbers.stats.filter(hasStat)).toHaveLength(3);
    const points = withLayout(cover, "points");
    expect(pointsOf(points).length).toBeGreaterThan(0);
  });
});

describe("newSlide", () => {
  it("opens with words, its layout's place and the look it continues", () => {
    const quote = newSlide("slide-1", "quote", {
      box: "dark",
      depth: 50,
      fill: { kind: "solid", preset: "plum" },
    });
    expect(quote.title).not.toBe("");
    expect(quote.box).toBe("dark");
    expect(quote.position).toBe(LAYOUT_DEFAULTS.quote.position);
    expect(quote.size).toBe(DEFAULT_TEXT_SIZE);
    expect(newSlide("slide-2", "title").fill).toEqual(LOOK_DEFAULTS.fill);
  });
});

describe("nextSlideId", () => {
  it("names a new slide after the highest number taken", () => {
    expect(nextSlideId(SAMPLE_DECK)).toBe("slide-1");
    const deck = {
      ...SAMPLE_DECK,
      slides: [...SAMPLE_DECK.slides, newSlide("slide-7", "title")],
    };
    expect(nextSlideId(deck)).toBe("slide-8");
  });
});

describe("the section resets", () => {
  it("say when the slide and look sections differ from their defaults", () => {
    const fresh = newSlide("slide-1", "points");
    expect(placementChanged(fresh)).toBe(false);
    expect(placementChanged({ ...fresh, size: 120 })).toBe(true);
    expect(placementChanged({ ...fresh, position: "center" })).toBe(true);
    expect(lookChanged(fresh)).toBe(false);
    expect(lookChanged({ ...fresh, box: "light" })).toBe(true);
  });
});

describe("pointsOf", () => {
  it("leaves out empty lines and the space around each point", () => {
    expect(
      pointsOf({ ...cover, points: "  First \n\n Second\n   \n" }),
    ).toEqual(["First", "Second"]);
  });
});
