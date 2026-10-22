import type { ComponentMeta } from "../../meta.ts";

export const meta: ComponentMeta = {
  name: "Reveal",
  kind: "primitive",
  purpose:
    "Fades and lifts its content in the first time it scrolls into view.",
  useWhen: [
    "Page sections below the fold: a bento grid, a stats strip, a feature list",
    "Anything that should arrive once as the reader reaches it",
  ],
  avoidWhen: [
    "Content above the fold or in app UI the user is already looking at",
    "A group whose items should arrive one by one: use Stagger",
    "Content that comes and goes: use Presence",
  ],
  related: ["Stagger", "Presence", "Loop"],
  a11y: "Content stays in the accessibility tree while hidden, so screen readers reach it in order. With reduced motion it shows at once.",
  motion: "presence",
  keyboard: [],
  layout:
    "A div as wide as its parent that takes its full size from the start: while it waits it's only transparent, never offset, so it neither pushes anything around nor spills out of its container. It has no hit area of its own.",
  reducedMotion: "It shows at once, with no fade or lift.",
};
