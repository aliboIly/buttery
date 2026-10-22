import { ReflowGroup, Stack, Text, useReflow } from "@buttery/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { RecommendationCard } from "@buttery/react";
import { motion } from "motion/react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "RecommendationCard",
  description:
    "A tip on a card: what to try, why, a link to do it and how long it takes, with optional media, dismissed for good once closed.",
  order: 70,
  status: "new",
  since: "0.7.0",
};

function RailNote(): ReactElement {
  return (
    <motion.div {...useReflow()}>
      <Text tone="secondary">
        The next card in the rail slides up once the tip is dismissed.
      </Text>
    </motion.div>
  );
}

function PhoneSketch(): ReactElement {
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

function tipCode({ title, badge, estimate, media }: DemoValues): string {
  return [
    "<RecommendationCard",
    `  title="${String(title)}"`,
    ...(badge === "Tip" ? [] : [`  badge="${String(badge)}"`]),
    '  action={{ label: "Turn on alerts", href: "/settings/alerts" }}',
    ...(estimate === "" ? [] : [`  estimate="${String(estimate)}"`]),
    ...(media === true
      ? [
          '  media={<img src={alertsPicture} alt="Alerts arriving on a phone" />}',
        ]
      : []),
    '  storageKey="low-stock-alerts"',
    ">",
    "  Get a message when a green coffee drops under two weeks of roasting.",
    "</RecommendationCard>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Send low-stock alerts to the roastery" },
    badge: { kind: "text", initial: "Tip" },
    estimate: { kind: "text", initial: "2 min" },
    media: { kind: "toggle", initial: true },
  },
  render: ({ title, badge, estimate, media }) => (
    <Stack style={{ maxInlineSize: "var(--bt-w-aside)" }}>
      <RecommendationCard
        key={String(media)}
        title={String(title)}
        badge={String(badge)}
        action={{ label: "Turn on alerts", href: "#settings-alerts" }}
        estimate={estimate === "" ? undefined : String(estimate)}
        media={media === true ? <PhoneSketch /> : undefined}
      >
        Get a message when a green coffee drops under two weeks of roasting.
      </RecommendationCard>
    </Stack>
  ),
  code: tipCode,
};

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
            media={<PhoneSketch />}
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
