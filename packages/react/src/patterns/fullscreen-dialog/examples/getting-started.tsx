import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, FullscreenDialog, OptionTiles } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

const NEEDS = [
  { value: "shop", label: "Sell online" },
  { value: "wholesale", label: "Sell to cafés" },
  { value: "subscriptions", label: "Run subscriptions" },
  { value: "counter", label: "Take payments at the counter" },
] as const;

type Need = (typeof NEEDS)[number]["value"];

/** A setup question that takes the whole window, its answer kept only once it's saved. */
export function GettingStarted(): ReactElement {
  const [open, setOpen] = useState(false);
  const [needs, setNeeds] = useState<readonly Need[]>([]);
  const [saved, setSaved] = useState<readonly Need[]>([]);
  const savedLabels = NEEDS.filter((need) => saved.includes(need.value)).map(
    (need) => need.label,
  );
  return (
    <Stack gap={2}>
      <FullscreenDialog
        open={open}
        onOpenChange={(next) => {
          setNeeds(saved);
          setOpen(next);
        }}
        trigger={<Button variant="primary">Set up the roastery</Button>}
        title="What do you need to get started?"
        note="You can change this later."
        actions={
          <>
            <Button
              variant="soft"
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setSaved(needs);
                setOpen(false);
              }}
            >
              Save
            </Button>
          </>
        }
      >
        <OptionTiles
          label="What you need"
          options={NEEDS}
          value={needs}
          onValueChange={setNeeds}
        />
      </FullscreenDialog>
      <Text variant="caption">
        {savedLabels.length === 0
          ? "Not set up yet"
          : `Saved: ${savedLabels.join(", ")}`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Set up the roastery");
  await press("checkbox", "Sell to cafés");
  await press("button", "Save");
  await see("Saved: Sell to cafés");
};
