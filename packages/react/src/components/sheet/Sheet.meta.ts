import type { ComponentMeta } from "@buttery/core";

export const meta: ComponentMeta = {
  name: "Sheet",
  kind: "component",
  purpose:
    "A modal panel that slides in from an edge of the window over a dimmed page: a side panel on a wide window and a drawer from the bottom on a phone.",
  useWhen: [
    "A shop's bag or cart, beside the page on a laptop and from the bottom on a phone",
    "Filters or settings for the page behind, longer than a dialog holds",
    "A record's details opened from a list, with its actions kept in view",
  ],
  avoidWhen: [
    "A decision or a short task that needs full attention: use Dialog",
    "A panel that should sit beside the page and narrow it rather than cover it, such as help: use SidePanel",
    "A few options under a button: use Menu or Popover",
    "A step that deserves its own address, such as checking out: use a page",
  ],
  related: ["Dialog", "SidePanel", "Popover", "Button", "TextStack"],
  a11y: "A modal dialog (aria-modal) named by its Sheet.Header title, or by label without one, and described by the header's description. Focus waits on the sheet while it slides in, then moves to its first field to type in, or stays on the sheet when it has none, so Tab starts at its first control. Tab stays inside; Escape, the close button, a press on the scrim or a drawer dragged down closes it, and focus goes back to what opened it. The page behind is hidden from screen readers while it's open. A drawer's handle only decorates: its close button and Escape do what dragging does.",
  motion: "presence",
  keyboard: [
    { keys: "Enter or Space", does: "Opens it from its trigger" },
    {
      keys: "Tab or Shift+Tab",
      does: "Moves to the next or previous control inside it, going round so focus never leaves it",
    },
    {
      keys: "Escape",
      does: "Closes it and hands focus back to what opened it",
    },
  ],
  layout:
    'Sheet.Content sits 8px inside the window. At the end or start it\'s as tall as the window less 16px and 400px wide at size="sm", the default, 560 at "md" and 880 at "lg", never wider than the window less 16px. At the bottom it takes the window\'s width less 16px and its content\'s height, up to the window less 64px, with a 24px handle strip across its top. side takes a side for each width, { base, md, lg }, changing at 640 and 1024px of window. Sheet.Header and Sheet.Footer keep their size while Sheet.Body scrolls between them; the footer stacks its children 12px apart at its full width. The close button is a 28px IconButton centered 24px in from the top and end edges, and the title keeps clear of it.',
  reducedMotion:
    "It and its scrim fade in and out over 100ms where it rests, without sliding; a drawer dragged short of closing lands back at once.",
};
