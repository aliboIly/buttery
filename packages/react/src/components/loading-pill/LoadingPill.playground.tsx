import type { DemoSection, DocsPage } from "@buttery/core";
import { LoadingPill } from "@buttery/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "LoadingPill",
  description:
    "A small pill with a spinner that says something is loading, shown only once loading has lasted 300ms.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Loading",
    description: "It appears 300ms after loading starts.",
    render: () => <LoadingPill label="Loading payouts" />,
  },
];
