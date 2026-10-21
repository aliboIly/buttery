import { Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { HoverActions, IconButton } from "@buttery/react";
import { Settings } from "lucide-react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "HoverActions",
  description:
    "A row whose actions show on hover and keyboard focus, with an accent bar.",
  order: 40,
  status: "new",
  since: "0.7.0",
};

const ROWS = [
  { name: "Orders waiting on payment", hint: "Emailed every morning" },
  { name: "Payouts", hint: "Emailed when a payout is sent" },
  { name: "Low green coffee", hint: "Off" },
];

export const demos: readonly DemoSection[] = [
  {
    title: "Settings rows",
    description:
      "Point at a row, or Tab to its gear, to show its action and bar.",
    render: () => (
      <Stack gap={1}>
        {ROWS.map((row) => (
          <HoverActions
            key={row.name}
            actions={
              <IconButton
                icon={Settings}
                label={`Settings for ${row.name.toLowerCase()}`}
                size="sm"
              />
            }
          >
            <Text variant="label">{row.name}</Text>
            <Text variant="caption">{row.hint}</Text>
          </HoverActions>
        ))}
      </Stack>
    ),
  },
];
