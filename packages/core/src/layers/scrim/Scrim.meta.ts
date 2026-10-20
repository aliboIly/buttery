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
  a11y: "Hidden from assistive technology (aria-hidden). The layer's own component handles focus and Escape; the scrim only takes pointer clicks.",
  motion: "presence",
};
