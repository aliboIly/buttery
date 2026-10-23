import { useState } from "react";
import type { ReactElement } from "react";
import { Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { DataTable, SegmentedControl } from "@butteryui/react";
import type { DataTableVariant } from "@butteryui/react";

interface Roast {
  readonly id: string;
  readonly coffee: string;
  readonly batch: number;
  readonly loss: number;
}

const ROASTS: readonly Roast[] = [
  { id: "r-118", coffee: "Guji, Ethiopia", batch: 12, loss: 14.2 },
  { id: "r-117", coffee: "Huila, Colombia", batch: 15, loss: 13.8 },
  { id: "r-116", coffee: "Cerrado, Brazil", batch: 20, loss: 15.1 },
  { id: "r-115", coffee: "Kiambu, Kenya", batch: 10, loss: 13.5 },
];

/** A roast log drawn plain, striped or bordered, picked with a segmented control. */
export function RoastLog(): ReactElement {
  const [variant, setVariant] = useState<DataTableVariant>("striped");
  return (
    <Stack gap={4}>
      <SegmentedControl<DataTableVariant>
        label="Table style"
        options={[
          { value: "plain", label: "Plain" },
          { value: "striped", label: "Striped" },
          { value: "bordered", label: "Bordered" },
        ]}
        value={variant}
        onValueChange={setVariant}
      />
      <DataTable
        label="Roast log"
        variant={variant}
        columns={[
          {
            id: "coffee",
            header: "Coffee",
            minWidth: "md",
            grow: 2,
            cell: (roast) => roast.coffee,
          },
          {
            id: "batch",
            header: "Batch (kg)",
            align: "end",
            cell: (roast) => roast.batch,
          },
          {
            id: "loss",
            header: "Weight loss",
            align: "end",
            cell: (roast) => `${roast.loss.toFixed(1)}%`,
          },
        ]}
        rows={ROASTS}
        rowKey={(roast) => roast.id}
      />
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ key, focus, see }) => {
  await see("Guji, Ethiopia");
  await focus("radio", "Striped");
  await key("ArrowRight");
  await see("Kiambu, Kenya");
};
