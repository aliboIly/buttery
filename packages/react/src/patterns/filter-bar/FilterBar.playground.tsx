import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Button, FilterBar, FilterPill } from "@buttery/react";
import { Download } from "lucide-react";

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
