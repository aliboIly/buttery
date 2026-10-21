import type { ComponentMeta } from "@buttery/core";

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
};
