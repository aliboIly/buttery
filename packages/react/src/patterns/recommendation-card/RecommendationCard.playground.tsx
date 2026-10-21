import { ReflowGroup, Stack, Text, useReflow } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { RecommendationCard } from "@buttery/react";
import { motion } from "motion/react";
import type { ReactElement } from "react";

function RailNote(): ReactElement {
  return (
    <motion.div {...useReflow()}>
      <Text tone="secondary">
        The next card in the rail slides up once the tip is dismissed.
      </Text>
    </motion.div>
  );
}

function Bands(): ReactElement {
  return (
    <svg
      viewBox="0 0 320 96"
      role="img"
      aria-label="Alerts arriving on a phone"
    >
      <rect width="320" height="96" fill="var(--bt-bg-section)" />
      <rect
        x="112"
        y="16"
        width="96"
        height="96"
        rx="16"
        fill="var(--bt-bg-surface)"
      />
      <rect
        x="128"
        y="36"
        width="64"
        height="8"
        rx="4"
        fill="var(--bt-skeleton-strong)"
      />
      <rect
        x="128"
        y="52"
        width="40"
        height="8"
        rx="4"
        fill="var(--bt-skeleton)"
      />
    </svg>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A tip in a rail",
    description: "Dismiss it: it fades where it is and what's below slides up.",
    render: () => (
      <ReflowGroup>
        <Stack gap={4} style={{ maxInlineSize: "var(--bt-w-aside)" }}>
          <RecommendationCard
            title="Send low-stock alerts to the roastery"
            action={{ label: "Turn on alerts", href: "#settings-alerts" }}
            estimate="2 min"
            media={<Bands />}
          >
            Get a message when a green coffee drops under two weeks of roasting.
          </RecommendationCard>
          <RailNote />
        </Stack>
      </ReflowGroup>
    ),
  },
  {
    title: "Text only, with its own badge",
    render: () => (
      <RecommendationCard
        title="Offer a subscription discount"
        badge="Suggested"
        action={{ label: "Create a discount", href: "#discounts" }}
      >
        Subscribers who start with a discount stay twice as long.
      </RecommendationCard>
    ),
  },
];
