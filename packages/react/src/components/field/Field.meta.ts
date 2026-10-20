import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Field",
  kind: "component",
  purpose:
    "A label, an optional hint and an error message wired to any form control by id.",
  useWhen: [
    "A form control buttery doesn't wrap, such as a native select or a range input",
    "Your own control that needs a label, a hint and an error read with it",
  ],
  avoidWhen: [
    "A line of text: use TextField",
    "A password: use PasswordField",
    "Longer text: use TextArea",
  ],
  related: ["TextField", "PasswordField", "TextArea"],
  a11y: "The label names the control through htmlFor and aria-labelledby, so custom controls (a slider thumb, a combobox) are named too; the hint and the error describe it through aria-describedby, and an error sets aria-invalid, so screen readers read all three when the control takes focus. A new error is also read out with the field's name as it appears, unless announceError is off because an error summary reads it. The error has an icon as well as its color. required sets aria-required.",
  motion: "none",
};
