import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Section",
  kind: "pattern",
  purpose:
    "A band of a page: room above and below, an optional heading and body, and its content in a Container.",
  useWhen: [
    "Each band of a landing or product page",
    'Setting a band apart with tone="muted"',
  ],
  avoidWhen: [
    "Grouping controls in an app: use Inspector.Section",
    "A hero: use SplitHero or CenteredHero, which are sections already",
  ],
  related: ["Page", "Container", "TextStack", "Bento"],
  a11y: "A section landmark named by its heading when it has one; the heading is an h2.",
  motion: "none",
};
