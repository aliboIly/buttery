import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Scrim",
  kind: "layer",
  purpose:
    "Covers the viewport behind a layer's content, dimmed for modals or blurred for menus over content.",
  useWhen: [
    "Behind a modal dialog (dim)",
    "Behind a menu that opens over page content (blur)",
  ],
  avoidWhen: [
    "Hiding content: unmount it instead",
    "Behind popovers that don't block the page",
  ],
  related: ["Layer", "Popover"],
  a11y: "Hidden from assistive technology (aria-hidden). The component inside the layer (a Radix Dialog, or Popover with its scrim prop) moves focus in, closes on Escape and treats a click on the scrim as a click outside.",
  motion: "presence",
  keyboard: [],
  layout:
    "It covers the whole window inside its layer and draws only a fill: --bt-overlay for dim, or --bt-wash over a 10px backdrop blur (--bt-blur-scrim) for blur. The whole scrim takes presses, which reach the component it sits under as a press outside.",
  reducedMotion:
    "It has no motion of its own: a dialog, sheet or nav bar fades it with its layer, over 100ms with reduced motion, and a popover's scrim shows and goes at once either way.",
};
