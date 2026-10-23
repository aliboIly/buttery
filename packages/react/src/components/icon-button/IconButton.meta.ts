import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "IconButton",
  kind: "component",
  purpose:
    "A square button that shows only an icon, named by a label that also appears as its tooltip.",
  useWhen: [
    "Header and toolbar actions with a well-known icon: undo, redo, help, settings",
    "Closing a dialog (size sm)",
    "Toggles, with aria-pressed",
    "Something new behind it, such as notifications, with dot",
    'A top bar\'s round create button, with variant="primary" and size sm',
  ],
  avoidWhen: [
    "An action without an icon everyone reads the same way: use Button with a label",
    "A page's main action, which needs its words: use Button variant primary",
  ],
  related: ["Button", "Tooltip"],
  a11y: 'A native button named by label (aria-label); the same label shows as a tooltip on hover and keyboard focus, which doesn\'t also describe the button, since it repeats the name; a description given in aria-describedby stays. Toggles use aria-pressed. A dot adds ", new" (or dotLabel) to the name.',
  motion: "press",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses it, unless it's aria-disabled",
    },
    { keys: "Enter", does: "Follows the link, when it's a link with asChild" },
  ],
  layout:
    'It\'s a circle 36px across (--bt-h-button) at size="md", the default, or 28px (--bt-h-sm) at "sm", and it never shrinks. The whole circle is the hit area. Its 16px icon sits in the middle, and the dot sits on the icon\'s top end corner without changing the button\'s size.',
  reducedMotion:
    "It presses in at once, without easing, while its hover color still fades over 120ms.",
};
