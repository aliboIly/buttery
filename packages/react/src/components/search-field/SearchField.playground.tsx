import { Stack } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { SearchField } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "SearchField",
  description:
    "A field for finding things: a search icon, a clear button once it holds text, and an optional shortcut that focuses it.",
  order: 80,
  status: "new",
  since: "0.7.0",
};

export const live: LiveDemo = {
  controls: {
    variant: {
      kind: "choice",
      options: ["outline", "soft"],
      initial: "outline",
    },
    label: { kind: "text", initial: "Search orders" },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ variant, label, disabled }) => (
    <SearchField
      variant={demoChoice(variant, ["outline", "soft"])}
      label={String(label)}
      disabled={disabled === true}
    />
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Soft and outline",
    description:
      "Soft on bg-control for a top bar, outlined for a toolbar. Type to see the clear button; Escape clears too.",
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
];
