import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SettingsIndex } from "@buttery/react";
import { Building2, Landmark, Truck } from "lucide-react";

const TITLES: Readonly<Record<string, string>> = {
  "#settings-business": "Business details",
  "#settings-shipping": "Shipping",
  "#settings-payouts": "Payouts",
  "#settings-more": "More settings",
};

/** A small settings page with two groups, the last ending with a dashed link to more, its links handed to the app. */
export function RoasterySettings(): ReactElement {
  const [opened, setOpened] = useState<string | null>(null);
  const open = (href: string, event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault();
    setOpened(TITLES[href] ?? href);
  };
  return (
    <Stack gap={4}>
      <SettingsIndex>
        <SettingsIndex.Section title="Your shop">
          <SettingsIndex.Link
            icon={Building2}
            title="Business details"
            description="The roastery's name, address and tax number."
            href="#settings-business"
            onNavigate={open}
          />
          <SettingsIndex.Link
            icon={Truck}
            title="Shipping"
            description="Rates by region, packaging and local pickup."
            href="#settings-shipping"
            onNavigate={open}
          />
        </SettingsIndex.Section>
        <SettingsIndex.Section title="Money">
          <SettingsIndex.Link
            icon={Landmark}
            title="Payouts"
            description="Your bank and when sales arrive."
            href="#settings-payouts"
            onNavigate={open}
          />
          <SettingsIndex.More
            title="Find more settings"
            description="Add-ons for tax, labels and accounting."
            href="#settings-more"
            onNavigate={open}
          />
        </SettingsIndex.Section>
      </SettingsIndex>
      <Text variant="caption">
        {opened === null ? "Pick a setting." : `Opening ${opened}.`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("link", /^Find more settings/);
  await see("Opening More settings.");
  await press("link", /^Payouts/);
  await see("Opening Payouts.");
};
