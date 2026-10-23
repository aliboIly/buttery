import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "ColorPicker",
  kind: "component",
  purpose:
    "A color area, a hue track and a hex code for picking any color, with optional presets.",
  useWhen: [
    "Picking any color inline, such as in a panel that stays open",
    "Building your own color control; ColorDot opens one in a popover",
  ],
  avoidWhen: [
    "A color in a row of controls: use ColorDot, which opens this in a popover",
    "Choosing from a fixed set: use SwatchGrid",
  ],
  related: ["ColorDot", "SwatchGrid", "Slider"],
  a11y: 'A group named by label holding three sliders, "Saturation" and "Brightness" for the area and "Hue" for the track, reading values such as "40%" and "210°", and a "Hex code" field. The area\'s two sliders share one Tab stop: left and right set the saturation, up and down the brightness, and focus moves to the slider changed so its value is read. Shift takes bigger steps, Page Up and Page Down ten steps, Home and End go to the ends. The code field edits a draft: Enter or leaving takes a valid code, Escape puts it back. Presets are a radio group.',
  motion: "indicator",
  keyboard: [
    {
      keys: "ArrowLeft or ArrowRight",
      does: "Sets the saturation 1% at a time in the area, or turns the hue 1° on the hue track",
    },
    {
      keys: "ArrowUp or ArrowDown",
      does: "Sets the brightness 1% at a time in the area, or turns the hue 1° on the hue track",
    },
    { keys: "Shift with an arrow key", does: "Takes a step ten times as big" },
    { keys: "Page Up or Page Down", does: "Takes ten steps at once" },
    {
      keys: "Home or End",
      does: "Goes to the start or the end of the slider with focus",
    },
    { keys: "Enter", does: "Takes the code typed in the hex code field" },
    { keys: "Escape", does: "Puts back a code that hasn't been taken yet" },
  ],
  layout:
    "It's 216px wide, never wider than its container, with the area at 3:2, the hue track, the code field and any presets 12px apart, the presets six to a row. The hue track's thumb stays inside it end to end, and the track's hit area reaches 28px tall.",
  reducedMotion:
    "Its thumbs land at once when a key, a typed code or a preset changes the color, instead of gliding there; a drag follows the pointer in the same frame either way.",
};
