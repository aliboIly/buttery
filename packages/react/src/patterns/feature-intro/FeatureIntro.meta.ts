import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "FeatureIntro",
  kind: "pattern",
  purpose:
    "Introduces a feature on its empty page: a title, a line, two or three benefits, a primary action and docs beside an image.",
  useWhen: [
    "A feature's page before it holds anything, such as subscriptions before the first plan",
    "Explaining what a feature does and the one step that starts it",
  ],
  avoidWhen: [
    "A list or table with nothing in it yet: use EmptyState in its place",
    "A tip about a feature already in use: use RecommendationCard",
  ],
  related: ["EmptyState", "RecommendationCard", "PageHeader", "AppPage"],
  a11y: "A section named by its title, an h2 by default. The benefits are a list. The action is a link styled as the primary button, or a button without an href; the docs link follows it. A dismissible intro's button is named Dismiss.",
  motion: "presence",
};
