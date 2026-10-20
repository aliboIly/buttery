import type { ComponentMeta } from "@buttery/core";

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
  motion: "press",
};
