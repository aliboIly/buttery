import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "RecommendationCard",
  kind: "pattern",
  purpose:
    "A tip on a card: what to try, why, a link to do it and how long it takes, with optional media, dismissed for good once closed.",
  useWhen: [
    "A page's right rail suggesting one feature to try, such as low-stock alerts",
    "An overview's tip that needs a title and a reason, not just a line",
  ],
  avoidWhen: [
    "One line across a page: use Banner",
    "Several steps to get set up: use SetupGuide",
    "Introducing a whole feature on an empty page: use FeatureIntro",
  ],
  related: ["Banner", "SetupGuide", "FeatureIntro", "AppPage"],
  a11y: "The title is an h3 by default. The action is a link, or a button without an href; the time estimate is read as Takes about and the time. The dismiss button is named Dismiss; once it's pressed the card fades and is gone, and focus in it moves on to the next tab stop.",
  motion: "presence",
};
