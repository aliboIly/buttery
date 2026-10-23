import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "FormDialog",
  kind: "pattern",
  purpose:
    "A dialog that asks for a value or two: its title over a divider, copy that can hold links, the fields with the first focused, and Cancel and Submit, Submit waiting until the form is valid.",
  useWhen: [
    "Adding or changing one or two values from a settings page, such as a backup email",
    "Naming something, such as a saved view",
  ],
  avoidWhen: [
    "A longer form: give it its own page or a SettingsSection",
    "Choosing between a few ways to do something: use ChoiceDialog or a RadioCardGroup in a dialog",
    "Confirming a purchase or a change with consequences: use ConsequenceDialog",
  ],
  related: ["Dialog", "TextField", "SettingsSection", "ConsequenceDialog"],
  a11y: "A modal dialog named by its title and described by its copy. Focus goes to its first field once it has settled and comes back to what opened it. Its content is a form: Enter in a field submits while it's valid, and Submit stays focusable but disabled (aria-disabled) until then, busy (aria-busy) while a returned promise is pending.",
  motion: "presence",
  keyboard: [
    {
      keys: "Enter",
      does: "Submits the form from a field while it's valid",
    },
    {
      keys: "Escape",
      does: "Closes it and puts focus back on what opened it, unless a submit is pending",
    },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves through the copy's links, the fields, Cancel, Submit and the close button, staying inside the dialog",
    },
  ],
  layout:
    "It's 400px wide (--bt-w-dialog) by default or 560px with size=\"md\" (--bt-w-dialog-md), never wider than the window less 16px a side, and as tall as its content until it meets the window's edges, when its content scrolls inside. Its title sits over a 1px divider, the copy and fields wrap, and Cancel and Submit, 36px tall, sit at the end of its footer.",
  reducedMotion:
    "It fades in and out with its scrim in 100ms, without growing from 97% or rising.",
};
