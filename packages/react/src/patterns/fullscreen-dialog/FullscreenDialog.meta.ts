import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "FullscreenDialog",
  kind: "pattern",
  purpose:
    "A dialog that takes the whole window for one big question, such as what someone needs to get started, its answer below and its actions at the bottom end.",
  useWhen: [
    "One question that deserves the whole screen, such as what someone needs at setup or how to start",
    "A choice with more tiles than a small dialog holds comfortably",
  ],
  avoidWhen: [
    "A short confirm: use Dialog",
    "A few fields to fill in: use FormDialog",
    "Spelling out what a yes costs: use ConsequenceDialog",
  ],
  related: ["Dialog", "OptionTiles", "RadioCardGroup", "FormDialog"],
  a11y: "A modal dialog named by its whole headline. Focus moves to the dialog itself as it opens and, once it has settled, to the first control in it; it stays inside, and goes back to what opened it when it closes. Escape or the close button closes it.",
  motion: "presence",
  keyboard: [
    {
      keys: "Escape",
      does: "Closes it and puts focus back on what opened it",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through the answer, the actions and the close button, staying inside the dialog",
    },
  ],
  layout:
    "It fills the window less 16px on every side. Its mark and close button sit at the top, its actions at the bottom end, 32px in from 640px of width and 24px in under it; the headline, in title-lg, and the answer sit centered in a column at most 640px wide, the headline wrapping, and its content scrolls inside it when it's taller than the window.",
  reducedMotion:
    "It fades in and out with its scrim in 100ms instead of 120ms; it never grows or rises.",
};
