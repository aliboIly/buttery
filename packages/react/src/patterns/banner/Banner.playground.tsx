import { Inline, ReflowGroup, Stack, Text, useReflow } from "@buttery/core";
import type { DemoFrame, DemoSection } from "@buttery/core";
import { Banner, Button } from "@buttery/react";
import { BarChart3 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ReactElement } from "react";

function Below(): ReactElement {
  return (
    <motion.div {...useReflow()}>
      <Text tone="secondary">
        This block slides up into the banner's place once it has faded.
      </Text>
    </motion.div>
  );
}

function DismissDemo(): ReactElement {
  const [round, setRound] = useState(0);
  return (
    <Stack gap={4}>
      <ReflowGroup>
        <Stack gap={4}>
          <Banner
            key={round}
            icon={BarChart3}
            action={{
              label: "Turn on automatic refunds",
              href: "#settings-refunds",
            }}
            estimate="1 min"
          >
            Refund orders flagged as fraud before they turn into disputes.
          </Banner>
          <Below />
        </Stack>
      </ReflowGroup>
      <Inline>
        <Button
          size="sm"
          onClick={() => {
            setRound((count) => count + 1);
          }}
        >
          Show the banner again
        </Button>
      </Inline>
    </Stack>
  );
}

export const frame: DemoFrame = "page";

export const demos: readonly DemoSection[] = [
  {
    title: "Dismissed in place",
    description:
      "Dismiss it: it fades where it is, then the block below slides up. Under 640px of room the action moves under the message.",
    render: () => <DismissDemo />,
  },
  {
    title: "Just a message",
    render: () => (
      <Banner>Orders placed after 2pm ship the next morning.</Banner>
    ),
  },
];
