import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, ConsequenceDialog } from "@buttery/react";
import { CalendarClock, CreditCard, Gift } from "lucide-react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "ConsequenceDialog",
  description:
    "A dialog that spells out what saying yes will do before anyone confirms.",
  order: 40,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Starting a trial",
    description:
      "What the trial costs and when, the small print, then one button.",
    render: () => (
      <ConsequenceDialog
        trigger={<Button variant="primary">Try Roaster</Button>}
        title="Try the Roaster plan"
        items={[
          {
            icon: Gift,
            title: "First 30 days free",
            body: "You keep your Starter price during the trial.",
          },
          {
            icon: CalendarClock,
            title: "Then $39 a month",
            body: "From November 20, unless you go back to Starter.",
          },
          {
            icon: CreditCard,
            title: "Charged to the card on file",
            body: "The card ending 4410.",
          },
        ]}
        terms={
          <>
            Starting the trial means you agree to the{" "}
            <a href="#consequence-dialog">plan terms</a>.
          </>
        }
        confirmLabel="Start the trial"
        onConfirm={() => undefined}
      />
    ),
  },
];
