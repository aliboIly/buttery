import { describe, expect, it } from "vitest";
import { MARGIN, anchorShift, cardBox } from "./geometry.ts";
import { CARD_RATIO, newCard } from "./state.ts";
import type { Card } from "./state.ts";
import { fileName } from "./export.ts";

const card: Card = { ...newCard(), width: 1600, height: 900 };
const margin = MARGIN * 900;

describe("cardBox", () => {
  it("fits the card's shape inside the margin, centered", () => {
    const box = cardBox(card);
    expect(box.height).toBeCloseTo(900 - 2 * margin);
    expect(box.width).toBeCloseTo(box.height * CARD_RATIO);
    expect(box.x + box.width / 2).toBeCloseTo(800);
    expect(box.y).toBeCloseTo(margin);
  });

  it("meets the margin on the anchored side", () => {
    const right = cardBox({ ...card, anchor: "right" });
    expect(right.x + right.width).toBeCloseTo(1600 - margin);
    const left = cardBox({ ...card, anchor: "top-left" });
    expect(left.x).toBeCloseTo(margin);
    expect(left.y).toBeCloseTo(margin);
  });
});

describe("anchorShift", () => {
  it("moves a smaller card toward its anchor by the room its size leaves", () => {
    expect(anchorShift({ ...card, scale: 80 })).toEqual({ x: 0, y: 0 });
    const corner = anchorShift({ ...card, scale: 80, anchor: "bottom-right" });
    expect(corner.x).toBeCloseTo(0.1);
    expect(corner.y).toBeCloseTo(0.1);
    expect(anchorShift({ ...card, scale: 100, anchor: "left" }).x).toBeCloseTo(
      0,
    );
    expect(anchorShift({ ...card, scale: 60, anchor: "top" }).y).toBeCloseTo(
      -0.2,
    );
  });
});

describe("fileName", () => {
  it("names the file after the title", () => {
    expect(fileName({ ...card, title: "Spring launch: v2!" }, "png")).toBe(
      "spring-launch-v2.png",
    );
    expect(fileName({ ...card, title: "  " }, "jpg")).toBe("card.jpg");
  });
});
