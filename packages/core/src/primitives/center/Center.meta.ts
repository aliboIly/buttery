import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Center",
  kind: "primitive",
  purpose: "Centers its content on both axes and fills the space it's given.",
  useWhen: ["Empty states and loading states inside a stage or panel"],
  avoidWhen: [
    "Centering text inside a control: controls already center their content",
  ],
  related: ["Stack", "FitBox"],
  a11y: "No role of its own.",
  motion: "none",
  keyboard: [],
  layout:
    "It's as wide as its parent and as tall as its content, or as tall as the height it's given, such as 100% of a sized panel. Its content sits in the middle on both axes and is never wider than Center. It has no hit area of its own.",
};
