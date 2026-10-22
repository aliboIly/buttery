import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { DataTable } from "@buttery/react";

interface Payout {
  readonly id: string;
  readonly date: string;
  readonly orders: number;
  readonly amount: number;
}

const PAYOUTS: readonly Payout[] = [
  { id: "po-0412", date: "Friday, April 12", orders: 38, amount: 1284.5 },
  { id: "po-0405", date: "Friday, April 5", orders: 31, amount: 1032 },
  { id: "po-0329", date: "Friday, March 29", orders: 42, amount: 1411.25 },
];

/** The least a table needs: a label, its columns and its rows, numbers aligned to the end. */
export function Payouts(): ReactElement {
  return (
    <DataTable
      label="Payouts"
      columns={[
        {
          id: "date",
          header: "Paid out",
          minWidth: "md",
          grow: 2,
          cell: (payout) => payout.date,
        },
        {
          id: "orders",
          header: "Orders",
          align: "end",
          cell: (payout) => payout.orders,
        },
        {
          id: "amount",
          header: "Amount",
          align: "end",
          cell: (payout) => (
            <DataTable.Amount value={payout.amount} currency="USD" />
          ),
        },
      ]}
      rows={PAYOUTS}
      rowKey={(payout) => payout.id}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Friday, April 12");
  await see("Friday, March 29");
};
