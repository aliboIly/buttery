import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Presence",
  kind: "primitive",
  purpose:
    "Shows and hides its content with an enter and an exit preset; exits are quicker than entrances.",
  useWhen: [
    "Content that appears and disappears: a saved note, a hint, extra options",
    "Anything that needs an exit animation before it unmounts",
  ],
  avoidWhen: [
    "Swapping one piece of content for another in place: use Morph",
    "Sections arriving as the page scrolls: use Reveal or Stagger",
    "Selection indicators: use SharedIndicator",
    "Toasts: call toast() from @butteryui/react",
  ],
  related: ["Morph", "Reveal", "FloatingLanes", "Toaster"],
  a11y: 'No role of its own. When the change needs announcing, keep a live region (role="status") mounted outside the Presence: a region that mounts along with its content often goes unannounced. With reduced motion it only fades, in 100ms.',
  motion: "presence",
  keyboard: [],
  layout:
    "While shown, its content renders in a div as wide as its parent. Once its exit has played it unmounts and takes no room, so what follows moves up into its place. It has no hit area of its own.",
  reducedMotion:
    "Every preset becomes a 100ms fade, in and out, without moving or scaling.",
};
