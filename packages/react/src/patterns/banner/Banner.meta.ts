import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Banner",
  kind: "pattern",
  purpose:
    "A one-line suggestion across a page: an icon, the message, an action and how long it takes, dismissed for good once closed.",
  useWhen: [
    "Suggesting one thing to set up on the page it helps with, such as a label printer above the orders table",
    "A notice people can act on or dismiss and not see again",
  ],
  avoidWhen: [
    "An error or a warning about what's on the page: use Callout, which can't be dismissed",
    "Something that just happened: use a toast",
    "A longer tip with a title and media: use RecommendationCard",
  ],
  related: ["Callout", "RecommendationCard", "AppPage", "SetupGuide"],
  a11y: "Its message and action read in the page's order. The action is a link, or a button without an href. The time estimate is read as Takes about and the time. The dismiss button is named Dismiss; once it's pressed the banner fades and is gone, and focus in it moves on to the next tab stop.",
  motion: "presence",
  keyboard: [
    { keys: "Enter", does: "Follows the action when it's a link" },
    {
      keys: "Enter or Space",
      does: "Presses the action when it's a button, or Dismiss, which fades the banner and moves focus on to the next tab stop",
    },
  ],
  layout:
    "It's as wide as its container, a bg-section strip with r12 corners whose row is at least 28px tall (--bt-h-sm), padded 8 above and below. The message takes the room between the icon and the action and wraps, the action moves under it under 640px of the banner's own width, and the action and the Dismiss button are 28px targets.",
  reducedMotion:
    "Dismissed, it fades out in 100ms and what's below takes its place at once instead of sliding up.",
};
