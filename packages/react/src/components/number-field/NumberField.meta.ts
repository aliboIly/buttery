import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "NumberField",
  kind: "component",
  purpose:
    "A small field for an exact number, with arrow-key steps, a stepper on hover and scrubbing by dragging its label.",
  useWhen: [
    "Exact sizes and positions: width, height, x, y, a crop in pixels",
    "Pairs of numbers in an inspector or a menu footer",
  ],
  avoidWhen: [
    "A value judged by eye: use Slider",
    "Free text or long numbers such as phone numbers: use a text input",
  ],
  related: ["Slider", "ValueBadge"],
  a11y: "A spinbutton named by its label: arrow keys step, Shift and an arrow steps ten, Enter or leaving commits what was typed, Escape puts back the last value. The stepper buttons skip the tab order, since the arrow keys do the same.",
  motion: "none",
  keyboard: [
    {
      keys: "Up or Down arrow",
      does: "Raises or lowers the value by one step",
    },
    { keys: "Shift and an arrow", does: "Moves it ten steps at a time" },
    { keys: "Enter", does: "Commits what was typed" },
    {
      keys: "Escape",
      does: "Puts back the last value, dropping what was typed",
    },
    {
      keys: "Tab",
      does: "Commits what was typed and moves on, past the stepper's buttons",
    },
  ],
  layout:
    'With labelPosition="side", the default, the label sits before a 128px field; with "top" it sits above a field that fills its column. The field is 34px tall (--bt-h-control) and its number uses tabular figures; a long label truncates with an ellipsis and shows in full as its title. The stepper\'s 24px buttons show on hover and focus, and a field narrower than 112px drops them, keeping the arrow keys and the label\'s scrub.',
};
