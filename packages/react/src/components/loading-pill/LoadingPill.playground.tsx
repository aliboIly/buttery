import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
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

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Loading payouts" },
    loading: { kind: "toggle", initial: true },
  },
  render: ({ label, loading }) => (
    <LoadingPill label={String(label)} loading={loading === true} />
  ),
  code: ({ label, loading }) =>
    `<LoadingPill label="${String(label)}" loading={${String(loading === true)}} />`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Loading",
    description: "It appears 300ms after loading starts.",
    render: () => <LoadingPill label="Loading payouts" />,
  },
];
