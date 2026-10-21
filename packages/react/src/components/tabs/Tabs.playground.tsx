import { Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Tabs } from "@buttery/react";

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
