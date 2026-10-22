import { useState } from "react";
import type { ReactElement } from "react";
import { Menu } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  FormDialog,
  GroupedList,
  InitialsTile,
  TextField,
} from "@buttery/react";

interface Lot {
  readonly id: string;
  readonly coffee: string;
  readonly detail: string;
  readonly kg: number;
}

interface Warehouse {
  readonly id: string;
  readonly name: string;
  readonly lots: readonly Lot[];
}

const WAREHOUSES: readonly Warehouse[] = [
  {
    id: "harbor",
    name: "Harbor Street",
    lots: [
      {
        id: "guji",
        coffee: "Guji, Ethiopia",
        detail: "Washed · arrived 3 Oct",
        kg: 640,
      },
      {
        id: "huila",
        coffee: "Huila, Colombia",
        detail: "Washed · arrived 19 Sep",
        kg: 410,
      },
    ],
  },
  {
    id: "mill",
    name: "Mill Lane",
    lots: [
      {
        id: "cerrado",
        coffee: "Cerrado, Brazil",
        detail: "Natural · arrived 28 Aug",
        kg: 1090,
      },
    ],
  },
];

const kilos = new Intl.NumberFormat("en-US");

/** Green coffee on hand: the total, then each warehouse's lots linking to their pages, each warehouse renamed or archived from its … menu. */
export function StockByWarehouse(): ReactElement {
  const [warehouses, setWarehouses] = useState(WAREHOUSES);
  const [renaming, setRenaming] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const total = warehouses
    .flatMap((warehouse) => warehouse.lots)
    .reduce((sum, lot) => sum + lot.kg, 0);
  return (
    <>
      <GroupedList>
        <GroupedList.Group>
          <GroupedList.Item
            title="All warehouses"
            media={<InitialsTile name="All warehouses" size="md" />}
            value={`${kilos.format(total)} kg`}
          />
        </GroupedList.Group>
        {warehouses.map((warehouse) => (
          <GroupedList.Group
            key={warehouse.id}
            title={warehouse.name}
            actions={
              <>
                <Menu.Item
                  onSelect={() => {
                    setDraft(warehouse.name);
                    setRenaming(warehouse.id);
                  }}
                >
                  Rename
                </Menu.Item>
                <Menu.Item
                  onSelect={() => {
                    setWarehouses(
                      warehouses.filter((other) => other.id !== warehouse.id),
                    );
                  }}
                >
                  Archive
                </Menu.Item>
              </>
            }
          >
            {warehouse.lots.map((lot) => (
              <GroupedList.Item
                key={lot.id}
                title={lot.coffee}
                description={lot.detail}
                media={<InitialsTile name={lot.coffee} size="md" />}
                value={`${kilos.format(lot.kg)} kg`}
                href={`#lots-${lot.id}`}
              />
            ))}
          </GroupedList.Group>
        ))}
      </GroupedList>
      <FormDialog
        open={renaming !== undefined}
        onOpenChange={(open) => {
          if (!open) setRenaming(undefined);
        }}
        title="Rename the warehouse"
        valid={draft.trim() !== ""}
        onSubmit={() => {
          setWarehouses(
            warehouses.map((warehouse) =>
              warehouse.id === renaming
                ? { ...warehouse, name: draft.trim() }
                : warehouse,
            ),
          );
        }}
        submitLabel="Rename"
      >
        <TextField
          label="Warehouse name"
          value={draft}
          onValueChange={setDraft}
        />
      </FormDialog>
    </>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("2,140 kg");
  await press("button", "Actions for Mill Lane");
  await press("menuitem", "Archive");
  await see("1,050 kg");
};
