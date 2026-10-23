import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Control",
  kind: "primitive",
  purpose:
    "The root of a fixed-height control you build yourself: a token height, matching padding and data-bt-control.",
  useWhen: [
    "Your own control, such as a stepper, a filter pill or a toggle, that has to sit at buttery's heights",
    "Making a Pressable or a link a fixed-height control with asChild",
  ],
  avoidWhen: [
    "An action: use Button, which is already a control",
    "A box that grows with its content: use Surface or Stack",
  ],
  related: ["Pressable", "Surface", "SharedIndicator", "Inline"],
  a11y: "Adds no role; give it one through what it renders (a Pressable button, a link) or its own role and keyboard handling.",
  motion: "none",
  keyboard: [],
  layout:
    "Its height is its size's token: --bt-h-badge (20px), --bt-h-sm (28px), --bt-h-control (34px, the default), --bt-h-button (36px) or --bt-h-cta (48px), with inline padding to match. It's as wide as its content and padding, on one line with its content centered 6px apart. Its hit area is whatever it renders, so a pressable one should be sm or taller: badge is under the 24px minimum.",
};
