import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SettingRow, SettingsSection } from "@butteryui/react";

/** Setting rows under a hairline, the one that turns something on in primary until it's on. */
export function FraudChecks(): ReactElement {
  const [screening, setScreening] = useState(true);
  const [savedCards, setSavedCards] = useState(false);
  return (
    <SettingsSection title="Fraud checks" divider>
      <SettingRow
        title="Screen subscription renewals"
        state={
          screening
            ? "Screening every renewal."
            : "Paused. Renewals go through unchecked."
        }
        action={
          <Button
            size="sm"
            onClick={() => {
              setScreening((on) => !on);
            }}
          >
            {screening ? "Pause screening" : "Resume screening"}
          </Button>
        }
      />
      <SettingRow
        title="Check saved cards"
        state={
          savedCards
            ? "On. Cards saved for later payments are checked."
            : "Off. Cards saved for later payments aren't checked."
        }
        action={
          <Button
            size="sm"
            variant={savedCards ? "soft" : "primary"}
            onClick={() => {
              setSavedCards((on) => !on);
            }}
          >
            {savedCards ? "Turn off" : "Turn on"}
          </Button>
        }
      />
    </SettingsSection>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Turn on");
  await see("On. Cards saved for later payments are checked.");
  await press("button", "Pause screening");
  await see("Paused. Renewals go through unchecked.");
};
