import { Inline, Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { ArrowLink, Button, SetupGuide } from "@buttery/react";
import type { SetupTask } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

const TASKS: readonly Omit<SetupTask, "done">[] = [
  {
    id: "coffee",
    title: "Add your first coffee",
    description: "Its origin, roast and bag sizes.",
    group: "Stock the shop",
  },
  {
    id: "photos",
    title: "Add photos of your bags",
    group: "Stock the shop",
  },
  {
    id: "shipping",
    title: "Set shipping rates",
    description: "What a bag costs to send, by region.",
    action: { label: "Set rates", href: "#settings-shipping" },
    group: "Take orders",
  },
  {
    id: "bank",
    title: "Connect your bank",
    description: "Where payouts go every Friday.",
    action: { label: "Connect", href: "#settings-payouts" },
    group: "Get paid",
  },
  {
    id: "launch",
    title: "Open the shop",
    description: "Customers can order once it's open.",
    group: "Get paid",
  },
];

function GuideDemo(): ReactElement {
  const [finished, setFinished] = useState(1);
  const [round, setRound] = useState(0);
  return (
    <Stack gap={4}>
      <Text tone="secondary">
        The guide floats at the bottom end of the window. Mark tasks done here
        to watch its bar fill.
      </Text>
      <Inline gap={2}>
        <Button
          size="sm"
          onClick={() => {
            setFinished((count) => Math.min(TASKS.length, count + 1));
          }}
        >
          Finish the next task
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setFinished(1);
            setRound((count) => count + 1);
          }}
        >
          Start over
        </Button>
      </Inline>
      <SetupGuide
        key={round}
        tasks={TASKS.map((task, index) => ({
          ...task,
          done: index < finished,
        }))}
        footer={<ArrowLink href="#setup-guide">Ask support</ArrowLink>}
      />
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A checklist in the lane",
    description:
      "Unfold it to see every task in groups that fold, the next one's group open and its action ready. Finish them all and it says you're all set. Dismiss it and it fades away.",
    render: () => <GuideDemo />,
  },
];
