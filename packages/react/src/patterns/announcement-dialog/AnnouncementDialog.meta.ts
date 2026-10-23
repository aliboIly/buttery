import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "AnnouncementDialog",
  kind: "pattern",
  purpose:
    "What's new, once: a large dialog with a title, short sections and an illustration, a Got it button and a link to read more.",
  useWhen: [
    "Telling people about a change to a page they already use, the first time they open it",
    "A release worth a moment, with a picture of what changed",
  ],
  avoidWhen: [
    "Something to set up: use SetupGuide or FeatureIntro",
    "A small tip: use Banner or NotificationNudge",
    "Anything urgent: say it on the page, where it stays",
  ],
  related: ["Dialog", "FeatureIntro", "NotificationNudge", "Banner"],
  a11y: "A modal dialog named by its title; each section's subheading is an h3. Focus starts on Got it, which closes it, as do Escape, the close button and a press outside; the read-more link follows it. Shown by itself once per storageKey, then only from its trigger.",
  motion: "presence",
  keyboard: [
    {
      keys: "Tab or Shift+Tab",
      does: "Moves between Got it, the read-more link and the close button, staying inside the dialog",
    },
    {
      keys: "Enter or Space",
      does: "Presses the focused button; Got it, where focus starts, closes the dialog",
    },
    {
      keys: "Enter",
      does: "Follows the read-more link, closing the dialog when it goes to a page in the app",
    },
    {
      keys: "Escape",
      does: "Closes it, handing focus back to the trigger unless it opened by itself",
    },
  ],
  layout:
    "It's 880px wide at most (--bt-w-dialog-lg) and 16px inside the window, padded 32, with the copy and the media in two equal columns from 720px of dialog and the media on top under that; the copy wraps, and a dialog taller than the window scrolls inside. Got it is a 36px button, and the close button a 28px one in the top corner.",
  reducedMotion:
    "It and its scrim fade in and out in 100ms, without growing or rising.",
};
