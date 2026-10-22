import type { DemoSection, DocsPage } from "@buttery/core";
import { DateRangeBar } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "DateRangeBar",
  description:
    "The period a report covers: a range with presets or two dates, the interval its charts group by, and what it's compared with.",
  order: 30,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Presets, an interval and a comparison",
    description:
      "Open the range for presets or two dates of your own; under 640px of room the comparison moves to its own row.",
    render: () => <DateRangeBar />,
  },
  {
    title: "A custom range",
    render: () => (
      <DateRangeBar
        defaultValue={{
          range: "custom",
          custom: { start: "2026-09-01", end: "2026-10-14" },
          interval: "weekly",
          comparison: "previous-year",
        }}
      />
    ),
  },
];
