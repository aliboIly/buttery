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
  keyboard: [],
  layout:
    'Its height is its content plus its room: 96px above and below by default, 64 with size="sm" and 128 with "lg", and inside a Page under 640px wide the default and "lg" take a step less. It fills its parent\'s width and puts its content in a Container, at most 1200px wide with the page\'s side padding; the heading and body wrap, 48px above the content (64 from 1024px of page), and it has no hit areas of its own.',
};
