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
  a11y: "A section named by its title, an h2 by default. The benefits are a list. The action is a link styled as the primary button, or a button without an href; the docs link follows it. A dismissible intro's button is named Dismiss; as the intro goes, focus in it moves on to the next tab stop.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses Dismiss, which fades the intro away and moves focus on to the next tab stop, or the action or docs link when it has no href",
    },
    {
      keys: "Enter",
      does: "Follows the action or the docs link when it has an href",
    },
  ],
  layout:
    "It takes its container's width and is its own size container: from 720px of it the copy and the media sit side by side in two equal columns 32px apart, and narrower the media goes under the copy. Nothing truncates, so the title, description and benefits wrap, and the dismiss button is a 28px icon button at the top end.",
  reducedMotion:
    "Dismissed, it fades out over 100ms, and what's below it in a ReflowGroup, such as an AppPage, takes its place at once.",
};
