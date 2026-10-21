import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "InitialsTile",
  kind: "component",
  purpose:
    "A square tile with up to two initials, standing in for a workspace or team that has no picture.",
  useWhen: [
    "A workspace's mark in a sidebar's workspace switcher or an account menu",
    "Teams or companies in a list, without logos",
  ],
  avoidWhen: [
    "A person: use Avatar, which is round and shows their picture",
    "A brand's own logo: show the logo",
  ],
  related: ["Avatar", "AccountMenu"],
  a11y: "Decorative by default, since the name is usually written beside it; give it a label when it stands alone, and it becomes an image named by it.",
  motion: "none",
};
