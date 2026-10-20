import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Inspector",
  kind: "pattern",
  purpose:
    "A settings panel of titled sections holding rows of controls, with a footer for its main actions.",
  useWhen: [
    "The settings beside a canvas or a preview: an editor's right-hand panel",
    "Any long list of controls grouped into sections that reset to defaults",
  ],
  avoidWhen: [
    "A form that's submitted: use the form fields with a submit button",
    "A few controls in a toolbar: use HeaderBar or FloatingToolbar",
  ],
  related: [
    "AppShell",
    "Slider",
    "SegmentedControl",
    "SwatchGrid",
    "TiltPad",
    "AnchorGrid",
  ],
  a11y: 'A named region; each section is a region named by its heading (an h2). Reset in a header is named with the section ("Reset Background") and stays focusable while dimmed. The sections scroll inside the panel, so the footer\'s actions are always in reach.',
  motion: "none",
};
