import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SettingsSection, TextField } from "@buttery/react";

/** A settings form whose Save and Cancel wait for a change, then save it. */
export function PickupAddressForm(): ReactElement {
  const [saved, setSaved] = useState("12 Mill Street, Portland");
  const [address, setAddress] = useState(saved);
  return (
    <Stack gap={4}>
      <SettingsSection
        title="Pickup address"
        description="Where customers collect their orders."
        dirty={address !== saved}
        onSave={() => {
          setSaved(address);
        }}
        onCancel={() => {
          setAddress(saved);
        }}
      >
        <TextField label="Address" value={address} onValueChange={setAddress} />
      </SettingsSection>
      <Text variant="caption">Saved: {saved}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await type("Address", ", side door");
  await press("button", "Save");
  await see("Saved: 12 Mill Street, Portland, side door");
};
