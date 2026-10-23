import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Breadcrumbs, Button, DetailPage } from "@butteryui/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** One plan's page: its price in the main column, choosing it the aside's one primary action. */
export function PlanDetail(): ReactElement {
  const [chosen, setChosen] = useState(false);
  return (
    <DetailPage
      title="Roaster plan"
      breadcrumbs={
        <Breadcrumbs
          items={[
            { label: "Settings", href: "/settings" },
            { label: "Plans", href: "/settings/plans" },
          ]}
        />
      }
      description="Billed monthly"
      action={
        <Button
          variant="primary"
          aria-disabled={chosen || undefined}
          onClick={() => {
            setChosen(true);
          }}
        >
          {chosen ? "Your plan" : "Choose this plan"}
        </Button>
      }
      aside={
        <DetailPage.Links
          title="Included"
          links={[
            { label: "Unlimited wholesale accounts", href: "/help/wholesale" },
            { label: "Roast planning", href: "/help/roast-planning" },
          ]}
        />
      }
    >
      <Text variant="title-lg">$39 a month</Text>
      <Text variant="body-sm">
        {chosen
          ? "The Roaster plan starts today."
          : "For a roastery selling to cafés as well as its own customers."}
      </Text>
    </DetailPage>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Choose this plan");
  await see("The Roaster plan starts today.");
};
