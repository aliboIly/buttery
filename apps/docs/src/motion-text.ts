import type { MotionClass } from "@butteryui/core";

/** What each motion class does, in a sentence for a component's Motion part. */
export const MOTION_TEXT: Readonly<Record<MotionClass, string>> = {
  none: "It doesn't move.",
  press:
    "It scales to 97% while it's pressed, over `--bt-dur-press`, and springs back when it's let go.",
  hover:
    "It answers the pointer and keyboard focus within `--bt-dur-fast`, such as an arrow growing its stem, without changing size.",
  indicator:
    "Its selection indicator slides to the chosen option on `spring.snappy`, inside one track.",
  presence:
    "It appears with a `Presence` preset and leaves faster than it came, in about 60% of the time.",
  morph:
    "It changes shape as one surface, on `spring.smooth`, or `spring.morph` for a big change, rather than closing and reopening.",
  loop: "It cycles its states every few seconds and pauses while it's offscreen.",
  celebration:
    "It celebrates a real finish with one short burst, never a routine action.",
};

/** What each motion class does with reduced motion, unless a component's meta says more. */
export const REDUCED_TEXT: Readonly<Record<MotionClass, string>> = {
  none: "Nothing changes.",
  press: "It presses in at once, without easing.",
  hover: "The change happens at once.",
  indicator: "The indicator moves at once.",
  presence: "It fades in and out in 100ms, without moving.",
  morph: "It takes its new shape at once.",
  loop: "It stops on its first state.",
  celebration: "It doesn't celebrate.",
};
