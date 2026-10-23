import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, ConsequenceDialog, PlanComparison } from "@buttery/react";
import { CalendarClock, CreditCard } from "lucide-react";

type PlanId = "starter" | "roaster";

const PLANS: Readonly<
  Record<PlanId, { readonly name: string; readonly price: string }>
> = {
  starter: { name: "Starter", price: "$19" },
  roaster: { name: "Roaster", price: "$39" },
};

/** Plan cards that ask first: a card's button spells out what the change will do, and confirming makes it. */
export function PlanChange(): ReactElement {
  const [current, setCurrent] = useState<PlanId>("starter");
  const [target, setTarget] = useState<PlanId>("roaster");
  const [open, setOpen] = useState(false);
  const action = (id: PlanId): ReactElement =>
    id === current ? (
      <Button variant="soft" aria-disabled>
        Your plan
      </Button>
    ) : (
      <Button
        variant="primary"
        onClick={() => {
          setTarget(id);
          setOpen(true);
        }}
      >
        {`Choose ${PLANS[id].name}`}
      </Button>
    );
  return (
    <Stack gap={4}>
      <PlanComparison
        plans={[
          {
            id: "starter",
            name: "Starter",
            description: "For a roastery selling to its own customers.",
            price: PLANS.starter.price,
            period: "per month",
            action: action("starter"),
            featuresTitle: "Includes",
            features: ["Online shop", "Subscriptions"],
          },
          {
            id: "roaster",
            name: "Roaster",
            description: "For a roastery that also sells to cafés.",
            price: PLANS.roaster.price,
            period: "per month",
            action: action("roaster"),
            featuresTitle: "Everything in Starter, and",
            features: ["Wholesale accounts", "Price lists"],
          },
        ]}
      />
      <ConsequenceDialog
        open={open}
        onOpenChange={setOpen}
        title={`Move to the ${PLANS[target].name} plan`}
        items={[
          {
            icon: CalendarClock,
            title: `Then ${PLANS[target].price} a month`,
            body: "From your next bill on November 20.",
          },
          {
            icon: CreditCard,
            title: "Charged to the card on file",
            body: "The card ending 4410.",
          },
        ]}
        confirmLabel={`Move to ${PLANS[target].name}`}
        onConfirm={() => {
          setCurrent(target);
        }}
      />
      <Text variant="caption">{`On the ${PLANS[current].name} plan`}</Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Choose Roaster");
  await see("Then $39 a month");
  await press("button", "Move to Roaster");
  await see("On the Roaster plan");
};
