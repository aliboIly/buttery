import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, ConsequenceDialog } from "@buttery/react";
import { CalendarClock, Gift } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";

/** A trial that starts only once its cost and timing have been read and confirmed. */
export function StartATrial(): ReactElement {
  const [started, setStarted] = useState(false);
  return (
    <Stack gap={2}>
      <ConsequenceDialog
        trigger={<Button variant="primary">Try Roaster</Button>}
        title="Try the Roaster plan"
        items={[
          {
            icon: Gift,
            title: "First 30 days free",
            body: "You keep your Starter price during the trial.",
          },
          {
            icon: CalendarClock,
            title: "Then $39 a month",
            body: "From November 20, unless you go back to Starter.",
          },
        ]}
        terms={
          <>
            Starting the trial means you agree to the{" "}
            <a href="/legal/plans">plan terms</a>.
          </>
        }
        confirmLabel="Start the trial"
        onConfirm={() => {
          setStarted(true);
        }}
      />
      <Text variant="caption">{started ? "Trial started" : "On Starter"}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Try Roaster");
  await press("button", "Start the trial");
  await see("Trial started");
};
