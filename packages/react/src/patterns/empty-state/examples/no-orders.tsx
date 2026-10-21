import type { ReactElement } from "react";
import { ArrowLink, Button, EmptyState } from "@buttery/react";
import { Receipt } from "lucide-react";

/** An app page with nothing in it yet: an icon tile, the way to add some, and where to read more. */
export function NoOrders(): ReactElement {
  return (
    <EmptyState
      icon={Receipt}
      title="No orders yet"
      description="Orders show up here once a customer checks out, or when you add one by hand."
      docs={<ArrowLink href="#orders-guide">How orders work</ArrowLink>}
      actions={<Button variant="primary">Add an order</Button>}
    />
  );
}
