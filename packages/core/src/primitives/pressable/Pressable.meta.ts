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
  a11y: 'A native button (type="button" by default) or its child with asChild; Enter and Space activate it. With aria-disabled it keeps focus and ignores presses.',
  motion: "press",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses it, unless it's aria-disabled",
    },
    {
      keys: "Enter",
      does: "Follows the link, when it renders one with asChild",
    },
  ],
  layout:
    "It has no size or look of its own: a button with no padding or border, as big as its content, so the Surface or Control you compose it with sizes it. Its hit area is the whole element; keep it at least 24px square, and 28px tall for a standalone button.",
  reducedMotion:
    "It still shrinks to 97% while it's pressed, but goes in and back out at once instead of easing.",
};
