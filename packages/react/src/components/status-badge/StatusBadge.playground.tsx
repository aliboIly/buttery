import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { StatusBadge } from "@buttery/react";
import { ArrowDownRight, ArrowUpRight, Lightbulb } from "lucide-react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "StatusBadge",
  description:
    "A short label for a record's state, such as Paid or Overdue, in a tone that repeats what it says.",
  order: 100,
  status: "new",
  since: "0.7.0",
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
