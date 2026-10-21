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
};
