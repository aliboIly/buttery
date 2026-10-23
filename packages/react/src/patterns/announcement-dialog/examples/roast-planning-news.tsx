import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { AnnouncementDialog, Banner } from "@buttery/react";

const BATCHES = [56, 88, 40, 72, 64];

function WeekOfRoasts(): ReactElement {
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
      {BATCHES.map((height, day) => (
        <g key={day} transform={`translate(${String(52 + day * 62)} 64)`}>
          <rect width="48" height="8" rx="4" fill="var(--bt-skeleton-strong)" />
          <rect
            y="24"
            width="48"
            height={height}
            rx="8"
            fill="var(--bt-accent-subtle)"
          />
        </g>
      ))}
    </svg>
  );
}

/** A banner on the roast plan that opens the full announcement, with an illustration and a link to read more. */
export function RoastPlanningNews(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={4}>
      <Banner
        action={{
          label: "See what's new",
          onClick: () => {
            setOpen(true);
          },
        }}
      >
        Roasts now plan themselves from orders and subscriptions.
      </Banner>
      <Text variant="body">Monday: 3 batches of the Hill Street blend.</Text>
      <AnnouncementDialog
        open={open}
        onOpenChange={setOpen}
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
        ]}
        media={<WeekOfRoasts />}
        learnMore={{
          label: "How roast planning works",
          href: "#roast-planning",
        }}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "See what's new");
  await see("Move a roast, keep the rest");
  await press("button", "Got it");
};
