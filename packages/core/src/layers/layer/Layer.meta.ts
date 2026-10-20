import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Layer",
  kind: "layer",
  purpose: "Renders its children above the page in a z band from the tokens.",
  useWhen: [
    "Building an overlay that isn't covered by an existing one: a custom panel, a drawer, a dev tool",
  ],
  avoidWhen: [
    "Menus, popovers and floating panels: use Popover",
    "Toasts and notices: use FloatingLanes.Item",
    "Moving content into a layer that already exists: use Portal",
  ],
  related: ["Portal", "Scrim", "Popover", "FloatingLanes"],
  a11y: "No role of its own. The layer's content keeps its own semantics; focus management belongs to the component inside (Popover, Dialog).",
  motion: "none",
};
