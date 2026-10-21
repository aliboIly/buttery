import type { ReactElement } from "react";
import { Banner } from "@buttery/react";
import { Printer } from "lucide-react";

/** A suggestion above the orders table that stays dismissed on later visits. */
export function LabelPrinterBanner(): ReactElement {
  return (
    <Banner
      icon={Printer}
      action={{ label: "Connect a label printer", href: "#settings-printing" }}
      estimate="3 min"
      storageKey="example-label-printer"
    >
      Print a shipping label from any order without leaving the page.
    </Banner>
  );
}
