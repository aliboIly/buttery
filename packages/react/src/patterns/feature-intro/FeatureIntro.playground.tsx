import type { DemoFrame, DemoSection } from "@buttery/core";
import { FeatureIntro } from "@buttery/react";
import { CalendarClock, Repeat, Truck } from "lucide-react";
import type { ReactElement } from "react";

export const frame: DemoFrame = "page";

function PlanPreview(): ReactElement {
  return (
    <svg
      viewBox="0 0 480 300"
      role="img"
      aria-label="A weekly subscription plan with its next three deliveries"
    >
      <rect width="480" height="300" rx="16" fill="var(--bt-bg-section)" />
      <rect
        x="64"
        y="48"
        width="352"
        height="204"
        rx="12"
        fill="var(--bt-bg-surface)"
      />
      <rect
        x="88"
        y="72"
        width="140"
        height="12"
        rx="6"
        fill="var(--bt-text-strong)"
      />
      <rect
        x="88"
        y="94"
        width="96"
        height="8"
        rx="4"
        fill="var(--bt-skeleton-strong)"
      />
      {[0, 1, 2].map((row) => (
        <g key={row} transform={`translate(88 ${String(128 + row * 36)})`}>
          <circle cx="8" cy="8" r="8" fill="var(--bt-accent-subtle)" />
          <rect
            x="28"
            y="4"
            width="160"
            height="8"
            rx="4"
            fill="var(--bt-skeleton-strong)"
          />
          <rect
            x="248"
            y="4"
            width="56"
            height="8"
            rx="4"
            fill="var(--bt-skeleton)"
          />
        </g>
      ))}
    </svg>
  );
}

const BENEFITS = [
  { icon: Repeat, text: "Customers choose every week or every two" },
  { icon: CalendarClock, text: "Each delivery is billed on its own day" },
  { icon: Truck, text: "Roasts ship the morning they're due" },
];

export const demos: readonly DemoSection[] = [
  {
    title: "Copy beside an image",
    description:
      "Side by side from 720px of room, stacked under that; this one can be put away.",
    render: () => (
      <FeatureIntro
        title="Sell your coffee by subscription"
        description="Ship a fresh bag on a schedule, without a new order each time."
        benefits={BENEFITS}
        action={{ label: "Create a plan", href: "#subscriptions-new" }}
        docs={{ label: "How subscriptions work", href: "#docs-subscriptions" }}
        media={<PlanPreview />}
        dismissible
      />
    ),
  },
  {
    title: "Copy only",
    render: () => (
      <FeatureIntro
        title="Pay out to your bank every Friday"
        description="Move the week's sales to your account on a set day."
        action={{ label: "Add a bank account", href: "#payouts-bank" }}
      />
    ),
  },
];
