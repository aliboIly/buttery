import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SettingsPage",
  kind: "pattern",
  purpose:
    "A settings detail page: breadcrumbs, a title with an optional scope badge, one line about it, then its sections, at most 960px wide.",
  useWhen: [
    "A page of settings under a settings index, such as pickup, the team or notifications",
    'A dense form or a preferences matrix, with width="narrow"',
  ],
  avoidWhen: [
    "The index of every settings page: use SettingsIndex on an AppPage",
    "A page of records, such as orders: use AppPage with a DataTable",
  ],
  related: [
    "SettingsSection",
    "SettingRow",
    "Breadcrumbs",
    "ScopeBadge",
    "AppPage",
  ],
  a11y: "The page's main landmark. Breadcrumbs come first as their own navigation; the title is the h1, each section a region named by its h2, and the footer a footer element after the sections.",
  motion: "none",
  keyboard: [],
  layout:
    'An AppPage at most 960px wide (820 with width="narrow"), centered, with 16, 24 or 32px of side padding as its column widens: the header first, its sections 24 under it and 32 apart, then a footer under a hairline. A long title truncates once the actions have folded into "…" and shows in full on hover; its hit areas are the breadcrumbs\' and actions\' own.',
};
