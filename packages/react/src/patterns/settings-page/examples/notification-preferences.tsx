import type { ExamplePlay } from "@buttery/core";
import {
  Breadcrumbs,
  Button,
  SettingRow,
  SettingsPage,
  SettingsSection,
} from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** A narrow settings page of rows, each turned on or off by its action. */
export function NotificationPreferences(): ReactElement {
  const [lowStock, setLowStock] = useState(false);
  return (
    <SettingsPage
      title="Notifications"
      width="narrow"
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Settings", href: "/settings" }]} />
      }
      description="What the roastery emails you about."
    >
      <SettingsSection title="Stock" divider>
        <SettingRow
          title="Green coffee running low"
          state={lowStock ? "Emailed when a lot drops under 200 kg." : "Off."}
          action={
            <Button
              size="sm"
              variant={lowStock ? "soft" : "primary"}
              onClick={() => {
                setLowStock((on) => !on);
              }}
            >
              {lowStock ? "Turn off" : "Turn on"}
            </Button>
          }
        />
      </SettingsSection>
    </SettingsPage>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Turn on");
  await see("Emailed when a lot drops under 200 kg.");
};
