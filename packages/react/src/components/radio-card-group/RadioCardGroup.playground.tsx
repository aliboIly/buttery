import type { DemoSection, DocsPage } from "@buttery/core";
import { RadioCardGroup, Select } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "RadioCardGroup",
  description:
    "One choice among a few explained options, one of which can reveal its own field.",
  order: 70,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "With a detail of its own",
    description: "Choose the second option to open its field.",
    render: () => (
      <RadioCardGroup
        label="Renewal screening"
        options={[
          {
            value: "all",
            label: "Screen every renewal",
            description: "Every renewal waits for a fraud check.",
          },
          {
            value: "some",
            label: "Screen the first renewals only",
            description: "Renewals after that go through without a check.",
            detail: (
              <Select
                label="Renewals to screen"
                variant="outline"
                options={[
                  { value: "1", label: "The first renewal" },
                  { value: "3", label: "The first three renewals" },
                ]}
              />
            ),
          },
        ]}
      />
    ),
  },
];
