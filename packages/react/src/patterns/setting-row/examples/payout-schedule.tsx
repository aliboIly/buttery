import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, SettingRow } from "@butteryui/react";

const SCHEDULES = ["Every Friday", "Every day", "On the 1st of each month"];

/** A setting changed by its row's action, its current state updating under the title. */
export function PayoutSchedule(): ReactElement {
  const [schedule, setSchedule] = useState(0);
  return (
    <SettingRow
      title="Payout schedule"
      state={SCHEDULES[schedule]}
      action={
        <Button
          size="sm"
          onClick={() => {
            setSchedule((current) => (current + 1) % SCHEDULES.length);
          }}
        >
          Change schedule
        </Button>
      }
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Every Friday");
  await press("button", "Change schedule");
  await see("Every day");
};
