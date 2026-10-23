import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ArrowLink",
  kind: "component",
  purpose:
    "A text link with the navigation arrow, for See all, Learn more and moving through content.",
  useWhen: [
    "A See all at the foot of a list or a menu",
    "Learn more under a feature, or Back to a parent page",
  ],
  avoidWhen: [
    "A link inside a sentence: use a plain link",
    "An action that changes something: use Button",
    "A call to action that should stand out: use Button with arrow",
  ],
  related: ["Button", "Pressable"],
  a11y: "A native link (or the element you give it with asChild), named by its label; the arrow is hidden from assistive technology. Keyboard focus shows the focus ring and an underline.",
  motion: "hover",
  keyboard: [
    { keys: "Enter", does: "Follows the link" },
    {
      keys: "Enter or Space",
      does: "Presses it, when it's a button given through asChild",
    },
  ],
  layout:
    "It's as wide as its label and arrow, never wider than its container, where a long label truncates with an ellipsis and shows in full as its title; the arrow growing never changes its width. Its hit area is the label's line plus 2px above and below, and as a button it's at least --bt-h-sm (28px) tall.",
  reducedMotion:
    "On hover or focus the chevron becomes the arrow at once, without the nudge.",
};
