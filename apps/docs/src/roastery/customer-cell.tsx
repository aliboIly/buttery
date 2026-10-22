import { DataTable } from "@buttery/react";
import type { ReactNode } from "react";
import { customerOf } from "./data.ts";

/** A table cell's customer: their name as a link to their page. */
export function customerCell(id: string): ReactNode {
  const customer = customerOf(id);
  if (customer === undefined) return "Removed customer";
  return (
    <DataTable.Link href={`#/roastery/customers/${customer.id}`}>
      {customer.name}
    </DataTable.Link>
  );
}
