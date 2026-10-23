import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "Stage",
  kind: "pattern",
  purpose:
    "The canvas an editor works on: fitted to the space at its shape, with artwork that may overlap its edges and a crop mode.",
  useWhen: [
    "The preview in an editor: a slide, a picture, a page",
    "Anything shown at a fixed shape that has to fit whatever room it gets",
  ],
  avoidWhen: [
    "Content that scrolls: use a page layout",
    "A thumbnail in a grid: use FitBox",
  ],
  related: ["AppShell", "FitBox", "FloatingToolbar", "DropZone"],
  a11y: "The canvas is an image named by label; what it shows is set from the controls around it. The crop handles take the pointer; the keyboard sets the same size through exact fields, such as width and height in a canvas Select's footer.",
  motion: "morph",
  keyboard: [],
  layout:
    "It fills its parent's box, so give the parent a height, and draws the largest canvas of its shape that fits 32px inside it, centered, r12 with a card shadow; artwork may overlap the canvas's edges, which clip it. In crop mode the eight 12px handles each have a 24px hit area.",
  reducedMotion:
    "The canvas takes its new shape at once, and in crop mode its background goes and its handles show without fading.",
};
