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
  a11y: "Keep looping content decorative or announce nothing: it changes on its own every few seconds. It holds still under the pointer, with focus inside, while the page is hidden and when paused, and stops on the first step with reduced motion. Beside content people read, give them a pause button that sets paused (WCAG 2.2.2).",
  motion: "loop",
  keyboard: [],
  layout:
    "It renders a div as wide as its parent and as tall as the step it shows, which can shrink below its content's width. It has no hit area of its own.",
  reducedMotion: "It stays on its first step and doesn't cycle.",
};
