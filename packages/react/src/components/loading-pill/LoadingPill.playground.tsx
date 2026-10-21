import type { DemoSection } from "@buttery/core";
import { LoadingPill } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Loading",
    description: "It appears 300ms after loading starts.",
    render: () => <LoadingPill label="Loading payouts" />,
  },
];
