import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SettingsSection",
  kind: "pattern",
  purpose:
    "A settings page's section: a heading, one line about it and its one action, then its content, which can load on its own or be a form whose Save waits for a change.",
  useWhen: [
    "Each group of settings on a SettingsPage",
    "A form on a settings page: Save stays disabled until something changes",
    "A section whose data arrives separately from the rest of the page",
  ],
  avoidWhen: [
    "Wrapping settings in a card: sections aren't cards",
    "A page section that isn't a setting: use AppPage.Section",
    "One setting with its state and an action: use SettingRow inside the section",
  ],
  related: ["SettingsPage", "SettingRow", "AppPage", "LoadingPill"],
  a11y: "A region named by its h2, its description a paragraph under it. While loading it's marked busy and its loading pill isn't read out. As a form, its content is a form element: Save is its submit button, Enter in a field saves while there's a change, and Save and Cancel stay focusable but disabled (aria-disabled) until something changes.",
  motion: "none",
};
