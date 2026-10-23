import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Breadcrumbs } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "Breadcrumbs",
  description:
    "The trail of pages above a nested page, as links above its title.",
  order: 20,
  status: "new",
  since: "0.8.0",
};

const TRAIL = [
  { label: "Settings", href: "/settings" },
  { label: "Plans and billing", href: "/settings/plans" },
  { label: "Roaster plan", href: "/settings/plans/roaster" },
  { label: "Invoices", href: "/settings/plans/roaster/invoices" },
];

export const live: LiveDemo = {
  controls: {
    items: { kind: "number", initial: 2, min: 1, max: 4 },
  },
  render: ({ items }) => <Breadcrumbs items={TRAIL.slice(0, Number(items))} />,
  code: ({ items }) =>
    [
      "<Breadcrumbs",
      "  items={[",
      ...TRAIL.slice(0, Number(items)).map(
        (item) => `    { label: "${item.label}", href: "${item.href}" },`,
      ),
      "  ]}",
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "A trail",
    description:
      "The pages above the one shown, outermost first; the page itself is its title.",
    render: () => (
      <Breadcrumbs
        items={[
          { label: "Settings", href: "#breadcrumbs" },
          { label: "Plans and billing", href: "#breadcrumbs" },
        ]}
      />
    ),
  },
  {
    title: "On a phone",
    description:
      "Under 480px of its own width it shows the page one level up, after a back chevron.",
    render: () => (
      <div style={{ inlineSize: "100%", maxInlineSize: "var(--bt-w-dialog)" }}>
        <Breadcrumbs
          items={[
            { label: "Settings", href: "#breadcrumbs" },
            { label: "Plans and billing", href: "#breadcrumbs" },
          ]}
        />
      </div>
    ),
  },
];
