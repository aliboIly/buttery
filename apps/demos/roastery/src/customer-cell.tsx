import { DataTable } from "@butteryui/react";
import type { ReactElement, ReactNode } from "react";
import { customerOf } from "./data.ts";
import { useLink } from "./router.tsx";

/** A customer's name as a link to their page. */
export function CustomerLink({
  id,
  name,
}: {
  readonly id: string;
  readonly name: string;
}): ReactElement {
  const link = useLink();
  return (
    <DataTable.Link href={link(`/customers/${id}`)}>{name}</DataTable.Link>
  );
}

/** A table cell's customer: their name as a link to their page. */
export function customerCell(id: string): ReactNode {
  const customer = customerOf(id);
  if (customer === undefined) return "Removed customer";
  return <CustomerLink id={customer.id} name={customer.name} />;
}
