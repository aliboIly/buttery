import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "FitBox",
  kind: "primitive",
  purpose:
    "Draws its content in the largest box of a given aspect ratio that fits, always centered.",
  useWhen: [
    "Stage canvases, media previews, anything that keeps its shape while the space around it changes",
  ],
  avoidWhen: [
    "Content that should scroll when it doesn't fit: use a scroll container",
  ],
  related: ["Center", "Surface"],
  a11y: "No role of its own; the content box is a plain div.",
  motion: "none",
};
