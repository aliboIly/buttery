import type { DemoSection } from "@buttery/core";
import { Button, EmptyState } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Empty canvas",
    description:
      "The title, its line 12px under it, and two pills 24px under the text.",
    render: () => (
      <EmptyState
        title="Add a card"
        description="Start from a template, or paste text with ⌘V."
        actions={
          <>
            <Button variant="primary">New card</Button>
            <Button variant="secondary">How it works</Button>
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
