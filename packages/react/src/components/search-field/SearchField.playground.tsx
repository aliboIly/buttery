import { Stack } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { SearchField } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "SearchField",
  description:
    "A field for finding things: a search icon, a clear button once it holds text, and an optional shortcut that focuses it.",
  order: 80,
  status: "new",
  since: "0.8.0",
};

export const live: LiveDemo = {
  controls: {
    variant: {
      kind: "choice",
      options: ["outline", "soft"],
      initial: "outline",
    },
    size: { kind: "choice", options: ["md", "sm", "lg"], initial: "md" },
    label: { kind: "text", initial: "Search orders" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ variant, size, label, disabled }) => (
    <SearchField
      variant={demoChoice(variant, ["outline", "soft"])}
      size={demoChoice(size, ["md", "sm", "lg"])}
      label={String(label)}
      disabled={disabled === true}
    />
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Soft and outline",
    description:
      "Soft on bg-control for a top bar, its edge showing on hover and focus; outlined for a toolbar. Type to see the clear button; Escape clears too.",
    render: () => (
      <Stack gap={4}>
        <SearchField variant="soft" label="Search everything" shortcut="/" />
        <SearchField label="Search orders" defaultValue="Guji" />
      </Stack>
    ),
  },
  {
    title: "Disabled",
    render: () => <SearchField label="Search payouts" disabled />,
  },
  {
    title: "Sizes",
    description:
      "28px for a dense toolbar, its clear button drawn at the badge height with a 28px target; 34px by default; 48px with 16px text for a page's own search.",
    render: () => (
      <Stack gap={4}>
        <SearchField size="sm" label="Filter batches" defaultValue="Guji" />
        <SearchField label="Search orders" />
        <SearchField size="lg" variant="soft" label="Search the shop" />
      </Stack>
    ),
  },
];
