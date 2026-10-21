import type { ReactElement } from "react";
import { Banner } from "@buttery/react";
import { BarChart3 } from "lucide-react";

/** A suggestion above the orders table that stays dismissed on later visits. */
export function AutomaticRefunds(): ReactElement {
  return (
    <Banner
      icon={BarChart3}
      action={{ label: "Turn on automatic refunds", href: "#settings-refunds" }}
      estimate="1 min"
      storageKey="example-automatic-refunds"
    >
      Refund orders flagged as fraud before they turn into disputes.
    </Banner>
  );
}
