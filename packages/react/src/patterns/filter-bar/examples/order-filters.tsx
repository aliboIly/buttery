import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import { Button, FilterBar, FilterPill } from "@buttery/react";
import { Download } from "lucide-react";

const STATUSES = ["Paid", "Unpaid", "Refunded"] as const;

/** Filters over an orders table: pick a status from its pill, clear it, or export. */
export function OrderFilters(): ReactElement {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);
  return (
    <FilterBar
      onClearAll={() => {
        setStatus(undefined);
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
        open={open}
        onOpenChange={setOpen}
        onRemove={() => {
          setStatus(undefined);
        }}
      >
        <Stack gap={1}>
          {STATUSES.map((choice) => (
            <Button
              key={choice}
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatus(choice);
                setOpen(false);
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
