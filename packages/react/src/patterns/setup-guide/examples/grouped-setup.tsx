import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, Button, SetupGuide } from "@buttery/react";

/** A shop's welcome card that opens its setup guide: tasks in groups that fold, progress on the card and in the guide. */
export function GroupedSetup(): ReactElement {
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState<readonly string[]>(["coffee", "photos"]);
  const finish = (id: string): void => {
    setDone((ids) => [...ids, id]);
  };
  const tasks = [
    { id: "coffee", title: "Add your first coffee", group: "Stock the shop" },
    { id: "photos", title: "Add photos of your bags", group: "Stock the shop" },
    {
      id: "shipping",
      title: "Set shipping rates",
      group: "Take orders",
      action: {
        label: "Mark as done",
        onClick: () => {
          finish("shipping");
        },
      },
    },
    {
      id: "tax",
      title: "Add your tax details",
      group: "Take orders",
      action: {
        label: "Mark as done",
        onClick: () => {
          finish("tax");
        },
      },
    },
    { id: "bank", title: "Connect your bank", group: "Get paid" },
  ].map((task) => ({ ...task, done: done.includes(task.id) }));
  return (
    <Surface level="card" pad={6}>
      <Stack gap={4} align="start">
        <Stack gap={1}>
          <Text variant="title-sm">Welcome to your shop</Text>
          <Text variant="body-sm" tone="secondary">
            {`${String(done.length)} of ${String(tasks.length)} tasks done`}
          </Text>
        </Stack>
        <Button
          onClick={() => {
            setShown(!shown);
          }}
        >
          {shown ? "Hide the setup guide" : "Show the setup guide"}
        </Button>
      </Stack>
      {shown ? (
        <SetupGuide
          title="Get your shop ready"
          tasks={tasks}
          footer={<ArrowLink href="#setup-guide">Ask support</ArrowLink>}
          onDismiss={() => {
            setShown(false);
          }}
        />
      ) : null}
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show the setup guide");
  await press("button", "Show all steps");
  await press("button", "Mark as done");
  await see("3 of 5 tasks done");
};
