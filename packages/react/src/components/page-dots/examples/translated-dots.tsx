import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, PageDots } from "@butteryui/react";

const SCHRITTE = ["Bohnen wählen", "Röstung planen", "Versand starten"];

/** Dots read out in German, "Schritt 2 von 3", with the step kept in state and moved by the buttons beside them. */
export function TranslatedDots(): ReactElement {
  const [step, setStep] = useState(0);
  return (
    <Stack gap={3} align="center" lang="de">
      <Text variant="title">{SCHRITTE[step]}</Text>
      <PageDots
        count={SCHRITTE.length}
        value={step}
        label={(current, count) =>
          `Schritt ${String(current + 1)} von ${String(count)}`
        }
      />
      <Inline gap={2}>
        <Button
          size="sm"
          arrow="back"
          aria-disabled={step === 0}
          onClick={() => {
            setStep(step - 1);
          }}
        >
          Zurück
        </Button>
        <Button
          size="sm"
          arrow="forward"
          aria-disabled={step === SCHRITTE.length - 1}
          onClick={() => {
            setStep(step + 1);
          }}
        >
          Weiter
        </Button>
      </Inline>
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Weiter");
  await see("Röstung planen");
  await press("button", "Weiter");
  await see("Versand starten");
};
