import type { ComponentMeta } from "@butteryui/core";

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
  keyboard: [],
  layout:
    'A square 20px across at size="xs", 24 at "sm", the default, 32 at "md" and 40 at "lg", with 6px corners up to "sm" and 8px from "md"; it never shrinks. Its one or two initials sit in the middle on one line and never wrap. It takes no presses, so it has no hit area.',
};
