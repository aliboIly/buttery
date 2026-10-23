import { Coffee } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Icon, Inline, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import {
  Button,
  Dialog,
  FullscreenDialog,
  SegmentedControl,
} from "@buttery/react";

const ROASTS = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "dark", label: "Dark" },
] as const;

type Roast = (typeof ROASTS)[number]["value"];

/** One big question from its trigger: a mark at the top start, the question and a quieter note, the answer, and Save. */
export function HouseRoast(): ReactElement {
  const [roast, setRoast] = useState<Roast>("medium");
  const [saved, setSaved] = useState<Roast | undefined>(undefined);
  const savedLabel = ROASTS.find((option) => option.value === saved)?.label;
  return (
    <Stack gap={2} align="start">
      <FullscreenDialog
        trigger={<Button>Choose a house roast</Button>}
        title="Which roast do you sell the most?"
        note="We'll suggest it first."
        logo={
          <Inline gap={2} align="center">
            <Icon icon={Coffee} />
            <Text variant="label">Pier Street Roasters</Text>
          </Inline>
        }
        actions={
          <Dialog.Close asChild>
            <Button
              variant="primary"
              onClick={() => {
                setSaved(roast);
              }}
            >
              Save
            </Button>
          </Dialog.Close>
        }
      >
        <SegmentedControl
          label="House roast"
          options={ROASTS}
          value={roast}
          onValueChange={setRoast}
        />
      </FullscreenDialog>
      <Text variant="caption">
        {savedLabel === undefined
          ? "No house roast yet"
          : `House roast: ${savedLabel}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Choose a house roast");
  await press("radio", "Dark");
  await press("button", "Save");
  await see("House roast: Dark");
};
