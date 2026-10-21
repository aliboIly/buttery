import { InitialsTile, GroupedList, toast } from "@buttery/react";
import type { ReactElement } from "react";
import { STOCK, coffeeOf } from "./data.ts";
import { kilograms, shortDate } from "./format.ts";

const WAREHOUSES = ["Harbor Street", "Mill Lane"] as const;

/** Green coffee on hand, a well per warehouse, with a row that adds a lot. Rows link to `href` when given. */
export function StockList({
  addLabel = "Add a lot",
  href,
}: {
  readonly addLabel?: string;
  readonly href?: string;
}): ReactElement {
  return (
    <GroupedList>
      {WAREHOUSES.map((warehouse) => (
        <GroupedList.Group key={warehouse} title={warehouse}>
          {STOCK.filter((lot) => lot.warehouse === warehouse).map((lot) => {
            const coffee = coffeeOf(lot.coffeeId);
            return (
              <GroupedList.Item
                key={lot.id}
                title={`${coffee.name}, ${coffee.origin}`}
                description={`${coffee.process} · arrived ${shortDate(lot.arrived)}`}
                media={
                  <InitialsTile
                    name={`${coffee.name} ${coffee.origin}`}
                    size="md"
                  />
                }
                value={kilograms(lot.kilograms)}
                href={href}
              />
            );
          })}
        </GroupedList.Group>
      ))}
      <GroupedList.Add
        label={addLabel}
        onClick={() => {
          toast("New lots come in from the importer's sheet in this demo.");
        }}
      />
    </GroupedList>
  );
}
