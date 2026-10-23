import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ConsequenceDialog",
  kind: "pattern",
  purpose:
    "A dialog that spells out what saying yes will do, in rows of icon, heading and line, with small print under a divider and one full-width button to confirm.",
  useWhen: [
    "Starting a trial, changing a plan or anything that costs money or can't be undone easily",
    "Confirming after a PlanComparison card's button",
  ],
  avoidWhen: [
    "A plain yes or no: use Dialog with Dialog.Actions",
    "Asking for values: use FormDialog",
  ],
  related: ["Dialog", "PlanComparison", "FormDialog"],
  a11y: "A modal dialog named by its title. Focus goes to the dialog itself so the consequences are read first; Tab reaches the links in the small print, then the confirm button, which is busy (aria-busy) while a returned promise is pending. Escape or the close button cancels, and focus goes back to what opened it. The rows' icons are decorative.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab or Shift+Tab",
      does: "Moves from the dialog itself to the links in the small print, the confirm button and the close button, staying inside",
    },
    {
      keys: "Enter or Space",
      does: "Presses the confirm button, which shows busy while a promise it returned is pending",
    },
    {
      keys: "Escape",
      does: "Cancels and puts focus back on what opened it, unless a confirm is pending",
    },
  ],
  layout:
    "It's 560px wide at most (--bt-w-dialog-md) and 16px inside the window, scrolling inside when it's taller. Its rows sit 20 apart, each a 32px icon tile beside a heading over a line that wraps, the small print sits under a 1px divider, and the confirm button is full width and 48px tall (--bt-h-cta).",
  reducedMotion:
    "It and its scrim fade in and out in 100ms, without growing or rising.",
};
