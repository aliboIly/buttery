import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { AnnouncementDialog, Button } from "@buttery/react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "AnnouncementDialog",
  description:
    "What's new, once: a large dialog with a title, short sections and an illustration, a Got it button and a link to read more.",
  order: 10,
  status: "new",
  since: "0.8.0",
};

function WeekPlan(): ReactElement {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Next week's roasts, filled in on a calendar"
    >
      <rect width="400" height="300" fill="var(--bt-bg-section)" />
      <rect
        x="32"
        y="40"
        width="336"
        height="220"
        rx="12"
        fill="var(--bt-bg-surface)"
      />
      {days.map((day, index) => (
        <g key={day} transform={`translate(${String(52 + index * 62)} 64)`}>
          <rect width="48" height="8" rx="4" fill="var(--bt-skeleton-strong)" />
          <rect
            y="24"
            width="48"
            height={String(40 + ((index * 23) % 60))}
            rx="8"
            fill="var(--bt-accent-subtle)"
          />
          <rect
            y={String(72 + ((index * 23) % 60))}
            width="48"
            height="40"
            rx="8"
            fill="var(--bt-skeleton)"
          />
        </g>
      ))}
    </svg>
  );
}

export const live: LiveDemo = {
  controls: {
    trigger: { kind: "text", initial: "See what's new" },
  },
  render: ({ trigger }) => (
    <AnnouncementDialog
      trigger={<Button>{String(trigger)}</Button>}
      title="Roasts plan themselves now"
      sections={[
        {
          title: "A week ahead",
          body: "Orders and subscriptions fill next week's roasts as they come in, by coffee and by day.",
        },
        { body: "Roasts you planned by hand stay as they are." },
      ]}
      media={<WeekPlan />}
      learnMore={{
        label: "How roast planning works",
        href: "#docs-roast-planning",
      }}
    />
  ),
  code: ({ trigger }) =>
    [
      "<AnnouncementDialog",
      `  trigger={<Button>${String(trigger)}</Button>}`,
      '  title="Roasts plan themselves now"',
      "  sections={[",
      '    { title: "A week ahead", body: "Orders and subscriptions fill next week\'s roasts as they come in, by coffee and by day." },',
      '    { body: "Roasts you planned by hand stay as they are." },',
      "  ]}",
      "  media={<WeekPlan />}",
      '  learnMore={{ label: "How roast planning works", href: "/docs/roast-planning" }}',
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "What's new, with an illustration",
    description:
      "Side by side in a wide window; the picture goes on top when the dialog is narrower than 720px.",
    render: () => (
      <AnnouncementDialog
        trigger={<Button>See what's new</Button>}
        title="Roasts plan themselves now"
        sections={[
          {
            title: "A week ahead",
            body: "Orders and subscriptions fill next week's roasts as they come in, by coffee and by day.",
          },
          {
            title: "Move a roast, keep the rest",
            body: "Drag a batch to another day and the bags it covers follow it.",
          },
          { body: "Roasts you planned by hand stay as they are." },
        ]}
        media={<WeekPlan />}
        learnMore={{
          label: "How roast planning works",
          href: "#docs-roast-planning",
        }}
      />
    ),
  },
];
