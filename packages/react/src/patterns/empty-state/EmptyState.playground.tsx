import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ArrowLink, Button, EmptyState } from "@buttery/react";
import { Receipt } from "lucide-react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "EmptyState",
  description:
    "What shows where content will be: a title, a line about how to add some, and the actions that do.",
  order: 40,
  status: "stable",
  since: "0.6.0",
};

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "No orders yet" },
    description: {
      kind: "text",
      initial:
        "Orders show up here once a customer checks out, or when you add one by hand.",
    },
    icon: { kind: "toggle", initial: true },
  },
  render: ({ title, description, icon }) => (
    <EmptyState
      icon={icon === true ? Receipt : undefined}
      title={String(title)}
      description={String(description)}
      docs={<ArrowLink href="#orders-guide">How orders work</ArrowLink>}
    />
  ),
  code: ({ title, description, icon }) =>
    [
      "<EmptyState",
      ...(icon === true ? ["  icon={Receipt}"] : []),
      `  title="${String(title)}"`,
      `  description="${String(description)}"`,
      '  docs={<ArrowLink href="/help/orders">How orders work</ArrowLink>}',
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Empty canvas",
    description:
      "The title, its line 12px under it, and two pills 24px under the text.",
    render: () => (
      <EmptyState
        title="An empty canvas"
        description="Start a fresh card, or open one from your library."
        actions={
          <>
            <Button variant="primary">New card</Button>
            <Button variant="secondary">Open library</Button>
          </>
        }
      />
    ),
  },
  {
    title: "Text only",
    render: () => (
      <EmptyState
        title="No exports yet"
        description="Cards you export show up here."
      />
    ),
  },
];
