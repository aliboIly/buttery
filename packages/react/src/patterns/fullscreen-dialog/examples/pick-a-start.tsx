import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Button, FullscreenDialog, RadioCardGroup } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

const STARTS = [
  {
    value: "template",
    label: "From a template",
    description: "A café menu with drinks and pastries filled in.",
  },
  {
    value: "scratch",
    label: "From scratch",
    description: "An empty menu to fill in yourself.",
  },
  {
    value: "import",
    label: "From a spreadsheet",
    description: "Items brought in from a CSV file.",
  },
] as const;

/** How a new menu starts, opened from code, with one choice as its answer. */
export function PickAStart(): ReactElement {
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState<string>("template");
  const [started, setStarted] = useState<string | null>(null);
  const startedWith = STARTS.find((option) => option.value === started);
  return (
    <Stack gap={2}>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        New menu
      </Button>
      <FullscreenDialog
        open={open}
        onOpenChange={setOpen}
        title="How do you want to start?"
        note="You can switch any time."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setStarted(start);
              setOpen(false);
            }}
          >
            Continue
          </Button>
        }
      >
        <RadioCardGroup
          label="How to start"
          value={start}
          onValueChange={setStart}
          options={STARTS}
        />
      </FullscreenDialog>
      <Text variant="caption">
        {startedWith === undefined
          ? "No menu yet"
          : `Started ${startedWith.label.toLowerCase()}`}
      </Text>
    </Stack>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "New menu");
  await press("radio", "From scratch");
  await press("button", "Continue");
  await see("Started from scratch");
};
