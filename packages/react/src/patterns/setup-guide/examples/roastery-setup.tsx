import type { ReactElement } from "react";
import { SetupGuide } from "@buttery/react";

/** A new roastery's setup, remembered across visits, two of three tasks done. */
export function RoasterySetup(): ReactElement {
  return (
    <SetupGuide
      title="Get your shop ready"
      storageKey="example-roastery-setup"
      tasks={[
        { id: "coffee", title: "Add your first coffee", done: true },
        { id: "shipping", title: "Set shipping rates", done: true },
        {
          id: "bank",
          title: "Connect your bank",
          description: "Where payouts go every Friday.",
          action: { label: "Connect", href: "#settings-payouts" },
        },
      ]}
    />
  );
}
