import type { ExamplePlay } from "@buttery/core";
import { Button, SettingRow, SettingsSection } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** Setting rows under a hairline, the one that turns something on in primary until it's on. */
export function FraudChecks(): ReactElement {
  const [savedCards, setSavedCards] = useState(false);
  return (
    <SettingsSection title="Fraud checks" divider>
      <SettingRow
        title="Screen subscription renewals"
        state="Screening every renewal."
        action={<Button size="sm">Manage screening</Button>}
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

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Turn on");
  await see("On. Cards saved for later payments are checked.");
};
