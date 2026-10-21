import type { ComponentMeta } from "@buttery/core";

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
};
