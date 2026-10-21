import type { ReactElement } from "react";
import { PageHeader } from "@buttery/react";
import { Download, Plus } from "lucide-react";

/** An orders page's header: the count after the title, and New order as the main action with its key. */
export function OrdersHeader(): ReactElement {
  return (
    <PageHeader
      title="Orders"
      value="1,284"
      valueInfo="Orders placed in the last 30 days."
      actions={
        <>
          <PageHeader.Action
            icon={Download}
            label="Export"
            onSelect={() => undefined}
          />
          <PageHeader.Action
            variant="primary"
            icon={Plus}
            label="New order"
            shortcut="n"
            priority={1}
            onSelect={() => undefined}
          />
        </>
      }
    />
  );
}
