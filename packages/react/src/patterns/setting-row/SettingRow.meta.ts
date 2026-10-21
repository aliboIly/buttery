import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "SettingRow",
  kind: "pattern",
  purpose:
    "One setting in a settings section: what it is, its current state under it, and its one action at the end.",
  useWhen: [
    "A setting whose change happens elsewhere, in a dialog or another page, opened by its action",
    "A list of such settings in a SettingsSection with divider",
  ],
  avoidWhen: [
    "A field edited in place: put the field in a SettingsSection form",
    "A grid of on and off choices across channels: use PreferencesMatrix",
  ],
  related: ["SettingsSection", "SettingsPage", "Button", "Switch"],
  a11y: 'Its title is an h3 under the section\'s h2; its state is a paragraph. The action is whatever control it\'s given, named on its own ("Manage screening", not just "Manage", when several rows have one).',
  motion: "none",
};
