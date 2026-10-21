import type { ReactElement } from "react";
import { FeatureIntro } from "@buttery/react";
import { CalendarClock, Repeat } from "lucide-react";

/** The subscriptions page before its first plan, put away for good once dismissed. */
export function SubscriptionsIntro(): ReactElement {
  return (
    <FeatureIntro
      title="Sell your coffee by subscription"
      description="Ship a fresh bag on a schedule, without a new order each time."
      benefits={[
        { icon: Repeat, text: "Customers choose every week or every two" },
        { icon: CalendarClock, text: "Each delivery is billed on its own day" },
      ]}
      action={{ label: "Create a plan", href: "#subscriptions-new" }}
      docs={{ label: "How subscriptions work", href: "#docs-subscriptions" }}
      dismissible
      storageKey="example-subscriptions-intro"
    />
  );
}
