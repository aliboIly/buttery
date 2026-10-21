import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { SearchField } from "@buttery/react";

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
