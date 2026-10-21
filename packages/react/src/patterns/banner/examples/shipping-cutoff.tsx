import { useState } from "react";
import type { ReactElement } from "react";
import { Banner } from "@buttery/react";
import { Truck } from "lucide-react";

/** A notice whose action opens something in place, through a button rather than a link. */
export function ShippingCutoff(): ReactElement {
  const [opened, setOpened] = useState(false);
  return (
    <Banner
      icon={Truck}
      action={{
        label: opened ? "Cutoff settings opened" : "Change the cutoff",
        onClick: () => {
          setOpened(true);
        },
      }}
    >
      Orders placed after 2pm ship the next morning.
    </Banner>
  );
}
