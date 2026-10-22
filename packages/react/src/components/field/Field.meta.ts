import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Field",
  kind: "component",
  purpose:
    "A label, an optional hint and an error message wired to any form control by id.",
  useWhen: [
    'A buttery control without a form label of its own, such as Select (variant="outline") or SegmentedControl',
    "Your own control that needs a label, a hint and an error read with it",
  ],
  avoidWhen: [
    "A line of text: use TextField",
    "A password: use PasswordField",
    "Longer text: use TextArea",
  ],
  related: [
    "TextField",
    "PasswordField",
    "TextArea",
    "Select",
    "SegmentedControl",
  ],
  a11y: "The label names the control through htmlFor and aria-labelledby, so custom controls (a slider thumb, a combobox) are named too; the hint and the error describe it through aria-describedby, and an error sets aria-invalid, so screen readers read all three when the control takes focus. A new error is also read out with the field's name as it appears, unless announceError is off because an error summary reads it. The error has an icon as well as its color. required sets aria-required.",
  motion: "none",
  keyboard: [],
  layout:
    "A column as wide as its container: the label, the hint 6px under it, the control 8px below them and the error 8px under the control. The label, the hint and the error wrap rather than truncate. Field adds no hit area of its own; the control keeps its own size and target.",
};
