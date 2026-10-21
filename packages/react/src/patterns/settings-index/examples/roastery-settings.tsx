import type { ReactElement } from "react";
import { SettingsIndex } from "@buttery/react";
import { Building2, Landmark, Truck } from "lucide-react";

/** A small settings page with two groups. */
export function RoasterySettings(): ReactElement {
  return (
    <SettingsIndex>
      <SettingsIndex.Section title="Your shop">
        <SettingsIndex.Link
          icon={Building2}
          title="Business details"
          description="The roastery's name, address and tax number."
          href="#settings-business"
        />
        <SettingsIndex.Link
          icon={Truck}
          title="Shipping"
          description="Rates by region, packaging and local pickup."
          href="#settings-shipping"
        />
      </SettingsIndex.Section>
      <SettingsIndex.Section title="Money">
        <SettingsIndex.Link
          icon={Landmark}
          title="Payouts"
          description="Your bank and when sales arrive."
          href="#settings-payouts"
        />
      </SettingsIndex.Section>
    </SettingsIndex>
  );
}
