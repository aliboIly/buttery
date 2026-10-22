import { Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
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
