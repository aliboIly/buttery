import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import {
  Breadcrumbs,
  ScopeBadge,
  SettingsPage,
  SettingsSection,
  TextField,
} from "@butteryui/react";

/** A settings page in the page grammar, its one section a form that saves a change. */
export function PickupSettings(): ReactElement {
  const [saved, setSaved] = useState("Weekdays 8:00 to 16:00");
  const [hours, setHours] = useState(saved);
  return (
    <SettingsPage
      title="Pickup"
      breadcrumbs={
        <Breadcrumbs items={[{ label: "Settings", href: "/settings" }]} />
      }
      badge={
        <ScopeBadge
          label="All shops"
          info="Pickup hours apply to every Halfmoon shop."
        />
      }
      description={`Pickup hours: ${saved}.`}
    >
      <SettingsSection
        title="Hours"
        description="When the counter hands out orders."
        dirty={hours !== saved}
        onSave={() => {
          setSaved(hours);
        }}
        onCancel={() => {
          setHours(saved);
        }}
      >
        <TextField
          label="Pickup hours"
          value={hours}
          onValueChange={setHours}
        />
      </SettingsSection>
    </SettingsPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Pickup hours", ", Saturdays 9:00 to 12:00");
  await press("button", "Save");
  await see("Pickup hours: Weekdays 8:00 to 16:00, Saturdays 9:00 to 12:00.");
};
