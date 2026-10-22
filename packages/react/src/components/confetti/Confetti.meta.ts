import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Confetti",
  kind: "component",
  purpose:
    "A short burst of confetti from an element, for a genuine finish such as completing onboarding.",
  useWhen: [
    "The last step of onboarding",
    "A first big success, once: the first export, the first published card",
  ],
  avoidWhen: [
    "Routine actions such as saving, deleting or copying",
    "Anything that happens more than once per user, or on page load",
  ],
  related: ["Presence", "Toast", "Onboarding"],
  a11y: "Decorative and hidden from assistive technology: announce the success itself in text. Never shown with reduced motion.",
  motion: "celebration",
  keyboard: [],
  layout:
    "It takes no room in the page and no presses: each burst is 5×8px pieces in the toast layer, thrown from the middle of the element passed to celebrate(), or of the window without one, and gone after 900ms.",
  reducedMotion:
    "It never bursts: celebrate() does nothing, so the success has to be said in text as well.",
};
