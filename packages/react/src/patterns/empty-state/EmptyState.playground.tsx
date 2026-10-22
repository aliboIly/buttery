import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, EmptyState } from "@buttery/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "EmptyState",
  description:
    "What shows where content will be: a title, a line about how to add some, and the actions that do.",
  order: 40,
  status: "stable",
  since: "0.5.0",
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
