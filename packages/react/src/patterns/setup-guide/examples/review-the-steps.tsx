import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, SetupGuide } from "@buttery/react";

/** The guide's unfolding kept in state: a button on the page shows it with every step, and its own chevron folds it. */
export function ReviewTheSteps(): ReactElement {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Button
        onClick={() => {
          setShown(true);
          setOpen(true);
        }}
      >
        Review the setup steps
      </Button>
      <Text variant="body-sm" tone="secondary">
        {shown
          ? open
            ? "Every step is showing."
            : "Only the next step is showing."
          : "The guide is put away."}
      </Text>
      {shown ? (
        <SetupGuide
          title="Open for orders"
          open={open}
          onOpenChange={setOpen}
          onDismiss={() => {
            setShown(false);
            setOpen(false);
          }}
          tasks={[
            { id: "menu", title: "Write your menu", done: true },
            {
              id: "hours",
              title: "Set your opening hours",
              description: "When customers can pick up.",
              action: { label: "Set hours", href: "#settings-hours" },
            },
            {
              id: "bank",
              title: "Connect your bank",
              description: "Where payouts go every Friday.",
            },
          ]}
        />
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Review the setup steps");
  await see("Every step is showing.");
  await see("When customers can pick up.");
  await press("button", "Hide steps");
  await see("Only the next step is showing.");
};
