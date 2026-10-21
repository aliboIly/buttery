import { Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { ArrowLink, SetupGuide } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** A setup split into groups that fold, done tasks checked, with a way to talk to someone at the end. */
export function GroupedSetup(): ReactElement {
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
    <>
      <Text variant="caption">{`${String(done.length)} of ${String(tasks.length)} tasks done`}</Text>
      <SetupGuide
        title="Get your shop ready"
        tasks={tasks}
        footer={
          <ArrowLink href="#setup-guide">Talk to the roasting team</ArrowLink>
        }
      />
    </>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Show all steps");
  await press("button", "Mark as done");
  await see("3 of 5 tasks done");
};
