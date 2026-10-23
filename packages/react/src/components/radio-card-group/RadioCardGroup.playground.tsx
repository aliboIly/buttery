import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { RadioCardGroup, Select } from "@butteryui/react";
import type { RadioCardOption } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "RadioCardGroup",
  description:
    "One choice among a few explained options, one of which can reveal its own field.",
  order: 70,
  status: "new",
  since: "0.8.0",
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
    size: { kind: "choice", options: ["md", "sm"], initial: "md" },
  },
  render: ({ label, options, size }) => {
    const set = demoChoice(options, SETS);
    return (
      <RadioCardGroup
        key={set}
        label={String(label)}
        options={OPTIONS[set]}
        size={demoChoice(size, ["md", "sm"])}
      />
    );
  },
  code: ({ label, options, size }) => `<RadioCardGroup
  label="${String(label)}"${size === "sm" ? '\n  size="sm"' : ""}
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
  {
    title: "Small",
    description:
      'size="sm": 14px radios beside 13px names, options 8 apart, for a dense panel. Each radio keeps a 24px target.',
    render: () => (
      <RadioCardGroup
        label="Pickup reminders"
        size="sm"
        options={[
          {
            value: "day",
            label: "The day before",
            description: "Sent at 9 in the morning.",
          },
          {
            value: "hour",
            label: "An hour before",
            description: "Sent as a text message.",
          },
          { value: "none", label: "No reminder" },
        ]}
      />
    ),
  },
];
