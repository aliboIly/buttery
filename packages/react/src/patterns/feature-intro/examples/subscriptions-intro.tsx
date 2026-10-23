import { CalendarClock, Repeat } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { FeatureIntro } from "@butteryui/react";

/** The subscriptions page before its first plan, put away for good once dismissed. */
export function SubscriptionsIntro(): ReactElement {
  const [putAway, setPutAway] = useState(false);
  return (
    <Stack gap={4}>
      <FeatureIntro
        title="Sell your coffee by subscription"
        description="Ship a fresh bag on a schedule, without a new order each time."
        benefits={[
          { icon: Repeat, text: "Customers choose every week or every two" },
          {
            icon: CalendarClock,
            text: "Each delivery is billed on its own day",
          },
        ]}
        action={{ label: "Create a plan", href: "#subscriptions-new" }}
        docs={{ label: "How subscriptions work", href: "#docs-subscriptions" }}
        dismissible
        storageKey="example-subscriptions-intro"
        onDismiss={() => {
          setPutAway(true);
        }}
      />
      {putAway ? (
        <Text variant="body" tone="secondary">
          Intro put away. Create a plan from Subscriptions whenever you like.
        </Text>
      ) : null}
    </Stack>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Sell your coffee by subscription");
  await press("button", "Dismiss");
  await see(
    "Intro put away. Create a plan from Subscriptions whenever you like.",
  );
};
