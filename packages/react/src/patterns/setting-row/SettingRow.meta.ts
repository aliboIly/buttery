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
  keyboard: [],
  layout:
    "It fills its parent's width: the title and state take the room left, wrapping rather than truncating, and the action keeps its own size 16px from them at the end, centered on the text. Its height is its text's, and its only hit area is the action's own.",
};
