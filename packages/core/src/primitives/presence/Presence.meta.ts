import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Presence",
  kind: "primitive",
  purpose:
    "Shows and hides its content with an enter and an exit preset; exits are quicker than entrances.",
  useWhen: [
    "Content that appears and disappears: a saved note, a toast, a hint",
    "Anything that needs an exit animation before it unmounts",
  ],
  avoidWhen: [
    "Swapping one piece of content for another in place: use Morph",
    "Sections arriving as the page scrolls: use Reveal or Stagger",
    "Selection indicators: use SharedIndicator",
  ],
  related: ["Morph", "Reveal", "FloatingLanes"],
  a11y: 'No role of its own. When the change needs announcing, keep a live region (role="status") mounted outside the Presence: a region that mounts along with its content often goes unannounced. With reduced motion it only fades, in 100ms.',
  motion: "presence",
};
