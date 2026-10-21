import type { ExamplePlay } from "@buttery/core";
import { SettingsIndex } from "@buttery/react";
import { Building2, Landmark, Truck } from "lucide-react";
import type { ReactElement } from "react";

/** A small settings page with two groups, the last ending with a dashed link to more. */
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
        <SettingsIndex.More
          title="Find more settings"
          description="Add-ons for tax, labels and accounting."
          href="#settings-more"
        />
      </SettingsIndex.Section>
    </SettingsIndex>
  );
}

export const play: ExamplePlay = async ({ see }) => {
  await see("Find more settings");
};
