import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Layer",
  kind: "layer",
  purpose: "Renders its children above the page in a z band from the tokens.",
  useWhen: [
    "Building an overlay that isn't covered by an existing one: a modal panel, a drawer, a blocking progress panel",
  ],
  avoidWhen: [
    "Menus, popovers and floating panels: use Popover",
    "Toasts and notices: use FloatingLanes.Item",
    "Moving content into a layer that already exists: use Portal",
  ],
  related: ["Portal", "Scrim", "Popover", "FloatingLanes"],
  a11y: "No role of its own. The layer's content keeps its own semantics; focus management belongs to the component inside (Popover, Dialog).",
  motion: "none",
  keyboard: [],
  layout:
    "Its container covers the window at its band's z-index, --bt-z-<band>, and lets presses through, so only the elements inside it take them; it has no size or hit area of its own. A layer opened inside another whose band is no higher mounts in that layer's container and stacks above it by order alone.",
};
