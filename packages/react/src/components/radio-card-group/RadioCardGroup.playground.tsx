import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { RadioCardGroup, Select } from "@buttery/react";
import type { RadioCardOption } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "RadioCardGroup",
  description:
    "One choice among a few explained options, one of which can reveal its own field.",
  order: 70,
  status: "new",
  since: "0.7.0",
};

const SETS = ["with lines", "with a detail", "one disabled"] as const;

const RENEWALS = (
  <Select
    label="Renewals to screen"
    variant="outline"
    options={[
      { value: "1", label: "The first renewal" },
      { value: "3", label: "The first three renewals" },
    ]}
  />
);

const OPTIONS: Readonly<
  Record<(typeof SETS)[number], readonly RadioCardOption[]>
> = {
  "with lines": [
    {
      value: "all",
      label: "Screen every renewal",
      description: "Every renewal waits for a fraud check.",
    },
    {
      value: "none",
      label: "Don't screen renewals",
      description: "Renewals go through without a check.",
    },
  ],
  "with a detail": [
    {
      value: "all",
      label: "Screen every renewal",
      description: "Every renewal waits for a fraud check.",
    },
    {
      value: "some",
      label: "Screen the first renewals only",
      description: "Renewals after that go through without a check.",
      detail: RENEWALS,
    },
  ],
  "one disabled": [
    {
      value: "all",
      label: "Screen every renewal",
      description: "Every renewal waits for a fraud check.",
    },
    {
      value: "manual",
      label: "Review each renewal yourself",
      description: "Needs a team of two or more.",
      disabled: true,
    },
  ],
};

const CODE: Readonly<Record<(typeof SETS)[number], string>> = {
  "with lines": `    { value: "all", label: "Screen every renewal", description: "Every renewal waits for a fraud check." },
    { value: "none", label: "Don't screen renewals", description: "Renewals go through without a check." },`,
  "with a detail": `    { value: "all", label: "Screen every renewal", description: "Every renewal waits for a fraud check." },
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
    },`,
  "one disabled": `    { value: "all", label: "Screen every renewal", description: "Every renewal waits for a fraud check." },
    { value: "manual", label: "Review each renewal yourself", description: "Needs a team of two or more.", disabled: true },`,
};

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "Renewal screening" },
    options: { kind: "choice", options: SETS, initial: "with a detail" },
  },
  render: ({ label, options }) => {
    const set = demoChoice(options, SETS);
    return (
      <RadioCardGroup key={set} label={String(label)} options={OPTIONS[set]} />
    );
  },
  code: ({ label, options }) => `<RadioCardGroup
  label="${String(label)}"
  options={[
${CODE[demoChoice(options, SETS)]}
  ]}
/>`,
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
