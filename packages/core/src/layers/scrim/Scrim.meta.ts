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
};
