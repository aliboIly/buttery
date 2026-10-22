import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, PageDots } from "@buttery/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "PageDots",
  description:
    "A row of dots showing which step of a few is current, the current one a pill that slides on spring.snappy.",
  order: 60,
  status: "stable",
  since: "0.6.0",
};

function Steps(): ReactElement {
  const [step, setStep] = useState(1);
  return (
    <Inline gap={4} align="center">
      <Button
        variant="soft"
        size="sm"
        arrow="back"
        aria-disabled={step === 0}
        onClick={() => {
          setStep(Math.max(0, step - 1));
        }}
      >
        Back
      </Button>
      <PageDots count={4} value={step} />
      <Button
        variant="soft"
        size="sm"
        arrow="forward"
        aria-disabled={step === 3}
        onClick={() => {
          setStep(Math.min(3, step + 1));
        }}
      >
        Next
      </Button>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Four steps",
    description:
      "The current dot is an 18px pill; moving on shrinks it as the next one grows, on spring.snappy.",
    render: () => <Steps />,
  },
  {
    title: "Two and six",
    render: () => (
      <Inline gap={6} align="center">
        <PageDots count={2} value={0} />
        <PageDots count={6} value={4} />
      </Inline>
    ),
  },
];
