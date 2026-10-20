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
};
