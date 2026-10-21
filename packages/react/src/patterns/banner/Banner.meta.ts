import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Banner",
  kind: "pattern",
  purpose:
    "A one-line suggestion across a page: an icon, the message, an action and how long it takes, dismissed for good once closed.",
  useWhen: [
    "Suggesting one thing to set up on the page it helps with, such as automatic refunds above the orders table",
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
};
