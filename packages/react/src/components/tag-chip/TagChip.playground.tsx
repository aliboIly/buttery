import { Inline, Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { TagChip } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "TagChip",
  description:
    "A small tag with a colored dot, outlined by default or soft or solid in its tone.",
  order: 150,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    tone: {
      kind: "choice",
      options: ["neutral", "info", "success", "warning", "danger"],
      initial: "success",
    },
    variant: {
      kind: "choice",
      options: ["outline", "soft", "solid"],
      initial: "outline",
    },
    children: { kind: "text", initial: "Free trial" },
  },
  render: ({ tone, variant, children }) => (
    <TagChip
      tone={demoChoice(tone, [
        "neutral",
        "info",
        "success",
        "warning",
        "danger",
      ])}
      variant={demoChoice(variant, ["outline", "soft", "solid"])}
    >
      {String(children)}
    </TagChip>
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tones",
    description: "The dot takes its tone's color; the words say what it is.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        <TagChip tone="info">New</TagChip>
        <TagChip tone="warning">Popular</TagChip>
        <TagChip tone="success">Free trial</TagChip>
        <TagChip>Easy setup</TagChip>
      </Inline>
    ),
  },
  {
    title: "Outline, soft and solid",
    description:
      "Outline, the default, colors only the dot; soft puts the words on the tone's subtle background; solid fills the tag with the tone's strong color. All three keep one size.",
    render: () => (
      <Stack gap={3}>
        {(["outline", "soft", "solid"] as const).map((variant) => (
          <Inline key={variant} gap={2} align="center" wrap>
            <TagChip variant={variant} tone="info">
              New
            </TagChip>
            <TagChip variant={variant} tone="warning">
              Popular
            </TagChip>
            <TagChip variant={variant} tone="success">
              Free trial
            </TagChip>
            <TagChip variant={variant} tone="danger">
              Last few
            </TagChip>
            <TagChip variant={variant}>Easy setup</TagChip>
          </Inline>
        ))}
      </Stack>
    ),
  },
];
