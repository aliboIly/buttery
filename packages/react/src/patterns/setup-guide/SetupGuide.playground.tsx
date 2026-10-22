import { Inline, Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ArrowLink, Button, SetupGuide } from "@buttery/react";
import type { SetupTask } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "SetupGuide",
  description:
    "A floating checklist in the bottom-end lane: progress, the next task, and every task when unfolded, remembered across visits.",
  order: 80,
  status: "new",
  since: "0.7.0",
};

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

function taskCode(task: Omit<SetupTask, "done">, done: boolean): string {
  const fields = [
    `id: "${task.id}"`,
    `title: "${task.title}"`,
    ...(task.description === undefined
      ? []
      : [`description: "${task.description}"`]),
    ...(task.action?.href === undefined
      ? []
      : [
          `action: { label: "${task.action.label}", href: "${task.action.href}" }`,
        ]),
    ...(task.group === undefined ? [] : [`group: "${task.group}"`]),
    ...(done ? ["done: true"] : []),
  ];
  return `{ ${fields.join(", ")} }`;
}

function LiveGuide({
  title,
  unfolded,
}: {
  readonly title: string;
  readonly unfolded: boolean;
}): ReactElement {
  const [shown, setShown] = useState(false);
  return (
    <Stack gap={3} align="start">
      <Text tone="secondary">
        {`"${title}" opens ${unfolded ? "unfolded" : "folded"} at the bottom end of the window, 2 of 5 tasks done.`}
      </Text>
      <Button
        onClick={() => {
          setShown(!shown);
        }}
      >
        {shown ? "Hide the setup guide" : "Show the setup guide"}
      </Button>
      {shown ? (
        <SetupGuide
          key={String(unfolded)}
          title={title === "" ? undefined : title}
          defaultOpen={unfolded}
          tasks={TASKS.map((task, index) => ({ ...task, done: index < 2 }))}
          onDismiss={() => {
            setShown(false);
          }}
        />
      ) : null}
    </Stack>
  );
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Get your shop ready" },
    defaultOpen: { kind: "toggle", initial: false },
  },
  render: ({ title, defaultOpen }) => (
    <LiveGuide title={String(title)} unfolded={defaultOpen === true} />
  ),
  code: ({ title, defaultOpen }) =>
    [
      "<SetupGuide",
      `  title="${String(title)}"`,
      ...(defaultOpen === true ? ["  defaultOpen"] : []),
      "  tasks={[",
      ...TASKS.map((task, index) => `    ${taskCode(task, index < 2)},`),
      "  ]}",
      "/>",
    ].join("\n"),
};

function GuideDemo(): ReactElement {
  const [shown, setShown] = useState(false);
  const [finished, setFinished] = useState(1);
  const [round, setRound] = useState(0);
  return (
    <Stack gap={4}>
      <Text tone="secondary">
        The guide floats at the bottom end of the window. Mark tasks done here
        to watch its bar fill.
      </Text>
      <Inline gap={2} wrap>
        <Button
          size="sm"
          onClick={() => {
            setShown(!shown);
          }}
        >
          {shown ? "Hide the setup guide" : "Show the setup guide"}
        </Button>
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
      {shown ? (
        <SetupGuide
          key={round}
          tasks={TASKS.map((task, index) => ({
            ...task,
            done: index < finished,
          }))}
          footer={<ArrowLink href="#setup-guide">Ask support</ArrowLink>}
          onDismiss={() => {
            setShown(false);
          }}
        />
      ) : null}
    </Stack>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "A checklist in the lane",
    description:
      "Show it, then unfold it to see every task in groups that fold, the next one's group open and its action ready. Finish them all and it says you're all set. Dismiss it and it fades away.",
    render: () => <GuideDemo />,
  },
];
