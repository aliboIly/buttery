import { Inline, ReflowGroup, Stack, Text, useReflow } from "@buttery/core";
import type { DemoFrame, DemoSection, DocsPage } from "@buttery/core";
import { Banner, Button } from "@buttery/react";
import { Printer } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Banner",
  description:
    "A one-line suggestion across a page: an icon, the message, an action and how long it takes, dismissed for good once closed.",
  order: 10,
  status: "new",
  since: "0.7.0",
};

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
            icon={Printer}
            action={{
              label: "Connect a label printer",
              href: "#settings-printing",
            }}
            estimate="3 min"
          >
            Print a shipping label from any order without leaving the page.
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
