import type { ComponentMeta } from "@buttery/core";

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
};
