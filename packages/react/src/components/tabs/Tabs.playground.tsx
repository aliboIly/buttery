import { Stack, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Tabs } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "Tabs",
  description:
    "Tabs that switch the panel under them, underlined, as pills or boxed on a track, with a sliding marker and the tabs that don't fit in a menu.",
  order: 130,
  status: "new",
  since: "0.8.0",
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
    variant: {
      kind: "choice",
      options: ["underline", "pills", "boxed"],
      initial: "underline",
    },
    tabs: { kind: "number", initial: 3, min: 3, max: 7, step: 1 },
  },
  render: ({ defaultValue, variant, tabs }) => {
    const shown = LIVE_SECTIONS.slice(0, typeof tabs === "number" ? tabs : 3);
    return (
      <Tabs
        key={String(defaultValue)}
        defaultValue={demoChoice(defaultValue, ["Overview", "Orders", "Notes"])}
        variant={demoChoice(variant, ["underline", "pills", "boxed"])}
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
  code: ({ defaultValue, variant, tabs }) => {
    const shown = LIVE_SECTIONS.slice(0, typeof tabs === "number" ? tabs : 3);
    const look = demoChoice(variant, ["underline", "pills", "boxed"]);
    return [
      `<Tabs defaultValue="${demoChoice(defaultValue, ["Overview", "Orders", "Notes"])}"${look === "underline" ? "" : ` variant="${look}"`}>`,
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
    title: "Pills and boxed",
    description:
      "pills slides a bg-control pill behind the chosen tab, with no line under the row; boxed raises the chosen tab on a bg-control track. Both slide on spring.snappy, as the underline does.",
    render: () => (
      <Stack gap={8}>
        {(["pills", "boxed"] as const).map((variant) => (
          <Tabs key={variant} defaultValue="Orders" variant={variant}>
            <Tabs.List label={`Customer, ${variant}`}>
              {SECTIONS.slice(0, 4).map((section) => (
                <Tabs.Tab key={section} value={section}>
                  {section}
                </Tabs.Tab>
              ))}
            </Tabs.List>
            {SECTIONS.slice(0, 4).map((section) => (
              <Tabs.Panel key={section} value={section}>
                <Text variant="body">{`${section} for Ines Vale.`}</Text>
              </Tabs.Panel>
            ))}
          </Tabs>
        ))}
      </Stack>
    ),
  },
  {
    title: "Not enough room",
    description:
      "In a narrow column, the last tabs fold into the … menu, whichever the variant.",
    render: () => (
      <Stack gap={6} style={{ maxInlineSize: "var(--bt-w-row-control)" }}>
        {(["underline", "boxed"] as const).map((variant) => (
          <Tabs key={variant} defaultValue="Overview" variant={variant}>
            <Tabs.List
              label={
                variant === "underline"
                  ? "Customer, narrow"
                  : "Customer, narrow and boxed"
              }
            >
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
        ))}
      </Stack>
    ),
  },
];
