import type { DemoSection } from "@buttery/core";
import { Button, EmptyState } from "@buttery/react";

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
