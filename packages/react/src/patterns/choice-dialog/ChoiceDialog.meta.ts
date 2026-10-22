import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "ChoiceDialog",
  kind: "pattern",
  purpose:
    "A dialog that offers a few ways to go: each a row with an icon, a title, a line and an arrow, choosing one closes it.",
  useWhen: [
    "Starting something that comes in a few kinds, such as a retail or a wholesale order",
    "Picking a report or a template before going to its page",
  ],
  avoidWhen: [
    "Two buttons: use a Dialog with Dialog.Actions",
    "Picking a value in a form: use Select or SegmentedControl",
    "More than six or so choices: use a page, such as SettingsIndex",
  ],
  related: ["Dialog", "SettingsIndex", "Menu"],
  a11y: "A modal dialog named by its title and described by its line. Focus starts on the first choice; each is a link or a button named by its title and line, and choosing one closes the dialog. Escape, the close button or a press outside closes it too, and focus goes back to what opened it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab or Shift+Tab",
      does: "Moves between the choices and the close button, staying inside the dialog",
    },
    {
      keys: "Enter",
      does: "Follows or runs the focused choice and closes the dialog",
    },
    {
      keys: "Space",
      does: "Runs the focused choice when it's a button, not a link, and closes the dialog",
    },
    {
      keys: "Escape",
      does: "Closes it and puts focus back on what opened it",
    },
  ],
  layout:
    "It's 560px wide at most (--bt-w-dialog-md) and 16px inside the window, scrolling inside when it's taller. Each choice is a full-width row padded 16, 8 apart: a 36px icon tile, its title over a line that wraps, and an arrow at the end, the whole row its hit area.",
  reducedMotion:
    "It and its scrim fade in and out in 100ms without growing or rising, and a row's arrow draws its stem at once, without the nudge.",
};
