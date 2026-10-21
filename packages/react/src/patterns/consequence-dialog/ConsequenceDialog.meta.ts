import type { ComponentMeta } from "@buttery/core";

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
};
