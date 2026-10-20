import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Stage",
  kind: "pattern",
  purpose:
    "The canvas an editor works on: fitted to the space at its shape, with artwork that may overlap its edges and a crop mode.",
  useWhen: [
    "The preview in an editor: a card, an image, a slide",
    "Anything shown at a fixed shape that has to fit whatever room it gets",
  ],
  avoidWhen: [
    "Content that scrolls: use a page layout",
    "A thumbnail in a grid: use FitBox",
  ],
  related: ["AppShell", "FitBox", "FloatingToolbar", "DropZone"],
  a11y: "The canvas is an image named by label; what it shows is set from the controls around it. The crop handles take the pointer; the keyboard sets the same size through exact fields, such as width and height in a canvas Select's footer.",
  motion: "morph",
};
