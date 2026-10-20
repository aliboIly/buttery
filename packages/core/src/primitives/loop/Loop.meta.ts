import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Loop",
  kind: "primitive",
  purpose:
    "Cycles a living demo through its steps, pausing off screen and under reduced motion.",
  useWhen: [
    "Product visuals in a hero or a card that quietly show the product working: a chart extending, a row appearing",
    "An idle onboarding scene that drifts between states",
  ],
  avoidWhen: [
    "Anything the user is editing or reading closely",
    "Progress or loading states: show the real state",
    "One-off arrivals: use Reveal or Stagger",
  ],
  related: ["Morph", "Presence", "Reveal"],
  a11y: "Keep looping content decorative or announce nothing: it changes on its own every few seconds. It stops on the first step with reduced motion.",
  motion: "loop",
};
