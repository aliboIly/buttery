import { Redo2, Undo2 } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton } from "@buttery/react";

const TITLES = ["Untitled card", "Spring launch", "Spring launch sale"];

/** Undo and redo in a header, each aria-disabled, and still focusable, while there's nothing for it to do. */
export function HistoryActions(): ReactElement {
  const [step, setStep] = useState(TITLES.length - 1);
  return (
    <Inline gap={3} align="center">
      <Inline gap={1}>
        <IconButton
          icon={Undo2}
          label="Undo"
          aria-disabled={step === 0}
          onClick={() => {
            setStep(step - 1);
          }}
        />
        <IconButton
          icon={Redo2}
          label="Redo"
          aria-disabled={step === TITLES.length - 1}
          onClick={() => {
            setStep(step + 1);
          }}
        />
      </Inline>
      <Text variant="label">{TITLES[step]}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Undo");
  await see("Spring launch");
  await press("button", "Undo");
  await see("Untitled card");
  await press("button", "Redo");
  await see("Spring launch");
};
