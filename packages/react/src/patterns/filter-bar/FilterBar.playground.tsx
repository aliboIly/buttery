import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, FilterBar, FilterPill } from "@buttery/react";
import { Download } from "lucide-react";

export const page: DocsPage = {
  section: "components/selection",
  title: "FilterBar",
  description:
    "A row of filter pills over a list that wrap as they're applied, with Clear filters and actions, folding into one button on a phone.",
  order: 40,
  status: "new",
  since: "0.7.0",
};

function Filters(): ReactElement {
  const [status, setStatus] = useState<string | undefined>("Unpaid");
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  return (
    <FilterBar
      onClearAll={() => {
        setStatus(undefined);
        setOrigin(undefined);
      }}
      actions={
        <Button size="sm" iconStart={Download}>
          Export
        </Button>
      }
    >
      <FilterPill
        label="Status"
        value={status}
        onRemove={() => {
          setStatus(undefined);
        }}
      >
        <Stack gap={1}>
          {["Paid", "Unpaid", "Refunded"].map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus(choice);
              }}
            >
              {choice}
            </Button>
          ))}
        </Stack>
      </FilterPill>
      <FilterPill
        label="Origin"
        value={origin}
        onRemove={() => {
          setOrigin(undefined);
        }}
      >
        <Stack gap={1}>
          {["Ethiopia", "Kenya", "Colombia"].map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setOrigin(choice);
              }}
            >
              {choice}
            </Button>
          ))}
        </Stack>
      </FilterPill>
    </FilterBar>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Filters",
    description:
      "Applied pills are solid with a remove button; press one for its editor. Under 640px they fold into one button.",
    render: () => <Filters />,
  },
];
