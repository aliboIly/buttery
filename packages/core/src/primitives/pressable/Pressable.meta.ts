import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Pressable",
  kind: "primitive",
  purpose: "An unstyled button with buttery's press feedback and focus ring.",
  useWhen: ["Making a custom surface clickable, such as a card or a swatch"],
  avoidWhen: [
    "Standard actions: use Button (Phase 4)",
    "Navigation: render a link with asChild instead of a button",
  ],
  related: ["Surface", "Icon"],
  a11y: 'A native button (type="button" by default) or its child with asChild; Enter and Space activate it.',
  motion: "press",
};
