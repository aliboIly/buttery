import { Stack, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Tabs } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "Tabs",
  description:
    "Underlined tabs that switch the panel under them, with a sliding underline and the tabs that don't fit in a menu.",
  order: 130,
  status: "new",
  since: "0.7.0",
};

const SECTIONS = [
  "Overview",
  "Orders",
  "Subscriptions",
  "Payments",
  "Notes",
] as const;

const LIVE_SECTIONS: readonly string[] = [
  "Overview",
  "Orders",
  "Notes",
  "Subscriptions",
  "Payments",
  "Activity",
  "Files",
];

export const live: LiveDemo = {
  controls: {
    defaultValue: {
      kind: "choice",
      options: ["Overview", "Orders", "Notes"],
      initial: "Overview",
    },
    tabs: { kind: "number", initial: 3, min: 3, max: 7, step: 1 },
  },
  render: ({ defaultValue, tabs }) => {
    const shown = LIVE_SECTIONS.slice(0, typeof tabs === "number" ? tabs : 3);
    return (
      <Tabs
        key={String(defaultValue)}
        defaultValue={demoChoice(defaultValue, ["Overview", "Orders", "Notes"])}
      >
        <Tabs.List label="Customer">
          {shown.map((section) => (
            <Tabs.Tab key={section} value={section}>
              {section}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {shown.map((section) => (
          <Tabs.Panel key={section} value={section}>
            <Text variant="body">{`${section} for Ines Vale.`}</Text>
          </Tabs.Panel>
        ))}
      </Tabs>
    );
  },
  code: ({ defaultValue, tabs }) => {
    const shown = LIVE_SECTIONS.slice(0, typeof tabs === "number" ? tabs : 3);
    return [
      `<Tabs defaultValue="${demoChoice(defaultValue, ["Overview", "Orders", "Notes"])}">`,
      '  <Tabs.List label="Customer">',
      ...shown.map(
        (section) => `    <Tabs.Tab value="${section}">${section}</Tabs.Tab>`,
      ),
      "  </Tabs.List>",
      ...shown.map(
        (section) =>
          `  <Tabs.Panel value="${section}">${section} for Ines Vale.</Tabs.Panel>`,
      ),
      "</Tabs>",
    ].join("\n");
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Underlined tabs",
    description:
      "The underline slides to the chosen tab on spring.snappy; arrow keys move along the row.",
    render: () => (
      <Tabs defaultValue="Overview">
        <Tabs.List label="Customer">
          {SECTIONS.map((section) => (
            <Tabs.Tab key={section} value={section}>
              {section}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {SECTIONS.map((section) => (
          <Tabs.Panel key={section} value={section}>
            <Text variant="body">{`${section} for Ines Vale.`}</Text>
          </Tabs.Panel>
        ))}
      </Tabs>
    ),
  },
  {
    title: "Not enough room",
    description: "In a narrow column, the last tabs fold into the … menu.",
    render: () => (
      <Stack style={{ maxInlineSize: "var(--bt-w-row-control)" }}>
        <Tabs defaultValue="Overview">
          <Tabs.List label="Customer, narrow">
            {SECTIONS.map((section) => (
              <Tabs.Tab key={section} value={section}>
                {section}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {SECTIONS.map((section) => (
            <Tabs.Panel key={section} value={section}>
              <Text variant="body">{section}</Text>
            </Tabs.Panel>
          ))}
        </Tabs>
      </Stack>
    ),
  },
];
