import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { StatTabs } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "StatTabs",
  description:
    "Equal tabs over a list that each show a view's count, the chosen one on a sliding raised panel, a select on a phone.",
  order: 100,
  status: "new",
  since: "0.8.0",
};

const TABS = [
  { value: "all", label: "All", count: 1284 },
  { value: "unpaid", label: "Unpaid", count: 12 },
  { value: "roasting", label: "Roasting", count: 31 },
  { value: "shipped", label: "Shipped", count: 1241 },
  { value: "refunded", label: "Refunded", count: 6 },
];

function tabsOf(count: unknown): typeof TABS {
  return TABS.slice(0, typeof count === "number" ? count : 4);
}

function chosenOf(value: unknown, count: unknown): string {
  const chosen = demoChoice(value, ["all", "unpaid", "roasting", "shipped"]);
  return tabsOf(count).some((tab) => tab.value === chosen) ? chosen : "all";
}

export const live: LiveDemo = {
  controls: {
    defaultValue: {
      kind: "choice",
      options: ["all", "unpaid", "roasting", "shipped"],
      initial: "all",
    },
    tabs: { kind: "number", initial: 4, min: 2, max: 5 },
  },
  render: ({ defaultValue, tabs }) => {
    const chosen = chosenOf(defaultValue, tabs);
    const shown = tabsOf(tabs);
    return (
      <StatTabs
        key={`${chosen} ${String(shown.length)}`}
        label="Orders by state"
        tabs={shown}
        defaultValue={chosen}
      />
    );
  },
  code: ({ defaultValue, tabs }) =>
    [
      "<StatTabs",
      '  label="Orders by state"',
      `  defaultValue="${chosenOf(defaultValue, tabs)}"`,
      "  tabs={[",
      ...tabsOf(tabs).map(
        (tab) =>
          `    { value: "${tab.value}", label: "${tab.label}", count: ${String(tab.count)} },`,
      ),
      "  ]}",
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Counts per state",
    description:
      "The panel slides to the tab chosen; under 640px of room it becomes a select.",
    render: () => (
      <StatTabs
        label="Orders by state"
        tabs={[
          { value: "all", label: "All", count: 1284 },
          { value: "unpaid", label: "Unpaid", count: 12 },
          { value: "roasting", label: "Roasting", count: 31 },
          { value: "shipped", label: "Shipped", count: 1241 },
        ]}
      />
    ),
  },
];
