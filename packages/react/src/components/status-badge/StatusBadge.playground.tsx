import { Inline, Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { StatusBadge } from "@butteryui/react";
import { ArrowDownRight, ArrowUpRight, Lightbulb } from "lucide-react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "StatusBadge",
  description:
    "A short label for a record's state, such as Paid or Overdue, in a tone that repeats what it says.",
  order: 100,
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
      options: ["soft", "solid", "outline"],
      initial: "soft",
    },
    children: { kind: "text", initial: "Paid" },
  },
  render: ({ tone, variant, children }) => (
    <StatusBadge
      tone={demoChoice(tone, [
        "neutral",
        "info",
        "success",
        "warning",
        "danger",
      ])}
      variant={demoChoice(variant, ["soft", "solid", "outline"])}
    >
      {String(children)}
    </StatusBadge>
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tones",
    description:
      "Neutral, info, success, warning and danger, each on its own subtle background.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        <StatusBadge>Draft</StatusBadge>
        <StatusBadge tone="info">Roasting</StatusBadge>
        <StatusBadge tone="success">Paid</StatusBadge>
        <StatusBadge tone="warning">Low stock</StatusBadge>
        <StatusBadge tone="danger">Overdue</StatusBadge>
      </Inline>
    ),
  },
  {
    title: "Soft, solid and outline",
    description:
      "Soft, the default, sits on the tone's subtle background; solid fills with the tone's strong color for a state that has to stand out; outline draws a 1px edge around the tone's words for a quieter row. All three keep one size.",
    render: () => (
      <Stack gap={3}>
        {(["soft", "solid", "outline"] as const).map((variant) => (
          <Inline key={variant} gap={2} align="center" wrap>
            <StatusBadge variant={variant}>Draft</StatusBadge>
            <StatusBadge variant={variant} tone="info">
              Roasting
            </StatusBadge>
            <StatusBadge variant={variant} tone="success">
              Paid
            </StatusBadge>
            <StatusBadge variant={variant} tone="warning">
              Low stock
            </StatusBadge>
            <StatusBadge variant={variant} tone="danger">
              Overdue
            </StatusBadge>
          </Inline>
        ))}
      </Stack>
    ),
  },
  {
    title: "With an icon",
    description: "A 12px icon before the label.",
    render: () => (
      <Inline gap={2} align="center" wrap>
        <StatusBadge tone="success" icon={ArrowUpRight}>
          8.1%
        </StatusBadge>
        <StatusBadge tone="danger" icon={ArrowDownRight}>
          2.3%
        </StatusBadge>
        <StatusBadge tone="info" icon={Lightbulb}>
          Tip
        </StatusBadge>
      </Inline>
    ),
  },
];
