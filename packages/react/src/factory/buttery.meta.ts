import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "buttery",
  kind: "component",
  purpose:
    "Makes any element or component buttery with token-typed props: a surface, spacing, a layout, press, focus and hover feedback, and an entrance or layout animation.",
  useWhen: [
    "Markup or a third-party component that should take buttery's surfaces, spacing and motion",
    "A one-off container that needs a surface and a layout but no component of its own",
  ],
  avoidWhen: [
    "Anything buttery has a component for: use the component",
    "Something people press built from a div: use buttery.button, or Pressable",
  ],
  related: ["Surface", "Stack", "Pressable", "Presence"],
  a11y: "Adds no roles: the element keeps its own semantics. press only belongs on things people can press, and a development warning says so. Entrances and layout animation follow reduced motion.",
  motion: "presence",
  keyboard: [],
  layout:
    "The element sizes itself as it would without the factory, adding only padding and gaps from the spacing scale and, with surface, the level's fill, radius and shadow. stack, inline and grid lay its children out as Stack, Inline and Grid do, truncate keeps its text to one line with an ellipsis and string children as its title, and it adds no hit area: the element's own box takes presses.",
  reducedMotion:
    'An entrance becomes a 100ms fade, or no animation for a stagger, layout changes land at once, a press scales at once, and hover="lift" deepens the shadow without rising.',
};
