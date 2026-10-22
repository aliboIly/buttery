import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Icon, Inline, Morph, Stack, Surface, Text } from "@buttery/core";
import {
  Button,
  Field,
  Section,
  SegmentedControl,
  Select,
  StatusBadge,
} from "@buttery/react";
import { CalendarClock, PackageCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAddToBag } from "./add-to-bag.ts";
import { Shelf } from "./BagArt.tsx";
import { useBag } from "./bag.ts";
import { GRINDS, coffeeOf, grindPhrase, notesOf } from "./data.ts";
import type { GrindId } from "./data.ts";
import { bags, money } from "./format.ts";
import {
  BAG_COUNTS,
  FREQUENCIES,
  GIFT_LENGTHS,
  PLAN_COFFEES,
  bagCountFrom,
  giftLengthFrom,
  planCoffeeName,
  planSchedule,
} from "./plan.ts";
import { planPrice } from "./pricing.ts";
import type {
  BagsPerDelivery,
  Frequency,
  GiftLength,
  PlanCoffee,
} from "./pricing.ts";

/** Who a subscription is for: the customer, or someone they give it to. */
export type PlanFor = "me" | "gift";

const PROMISES: readonly {
  readonly icon: LucideIcon;
  readonly text: string;
}[] = [
  { icon: Truck, text: "Every delivery ships free" },
  { icon: CalendarClock, text: "Skip, change or pause any time" },
  { icon: PackageCheck, text: "Roasted the morning it ships" },
];

/**
 * The subscription builder: how often, how many bags, which coffee and grind, and whether it's a gift, with
 * the price per delivery following each choice.
 */
export function Subscribe({
  planFor,
  onPlanForChange,
}: {
  readonly planFor: PlanFor;
  readonly onPlanForChange: (planFor: PlanFor) => void;
}): ReactElement {
  const [every, setEvery] = useState<Frequency>("two-weeks");
  const [count, setCount] = useState<BagsPerDelivery>(1);
  const [coffee, setCoffee] = useState<PlanCoffee>("choice");
  const [grind, setGrind] = useState<GrindId>("whole");
  const [length, setLength] = useState<GiftLength>(3);
  const [bag] = useBag();
  const { addPlan } = useAddToBag();
  const gift = planFor === "gift" ? length : null;
  const price = planPrice(coffee, count, gift);
  return (
    <Section
      id="subscribe"
      title="Never run out"
      body="Choose how often and how much. Every bag in a subscription is 10% off and ships free, and you can skip, change or pause it from your account."
    >
      <Grid columns={{ base: 1, lg: 2 }} gap={4}>
        <Surface level="card" pad={6}>
          <Stack gap={5}>
            <Field label="Who it's for">
              {(control) => (
                <SegmentedControl<PlanFor>
                  {...control}
                  label="Who it's for"
                  options={[
                    { value: "me", label: "For me" },
                    { value: "gift", label: "As a gift" },
                  ]}
                  value={planFor}
                  onValueChange={onPlanForChange}
                />
              )}
            </Field>
            <Field label="How often">
              {(control) => (
                <SegmentedControl<Frequency>
                  {...control}
                  label="How often"
                  options={FREQUENCIES}
                  value={every}
                  onValueChange={setEvery}
                />
              )}
            </Field>
            <Field
              label="Bags each time"
              hint="Each bag holds 12 oz, about 20 cups."
            >
              {(control) => (
                <SegmentedControl
                  {...control}
                  label="Bags each time"
                  options={BAG_COUNTS.map((option) => ({
                    value: String(option),
                    label: bags(option),
                  }))}
                  value={String(count)}
                  onValueChange={(next) => {
                    setCount(bagCountFrom(next) ?? count);
                  }}
                />
              )}
            </Field>
            <Grid columns={{ base: 1, md: 2 }} gap={4}>
              <Field label="Coffee">
                {(control) => (
                  <Select<PlanCoffee>
                    {...control}
                    label="Coffee"
                    variant="outline"
                    options={PLAN_COFFEES}
                    value={coffee}
                    onValueChange={setCoffee}
                  />
                )}
              </Field>
              <Field label="Grind">
                {(control) => (
                  <Select<GrindId>
                    {...control}
                    label="Grind"
                    variant="outline"
                    options={GRINDS}
                    value={grind}
                    onValueChange={setGrind}
                  />
                )}
              </Field>
            </Grid>
            <Morph contentKey={planFor}>
              {planFor === "gift" ? (
                <Field
                  label="Deliveries in the gift"
                  hint="Paid today. We email them a card with the first delivery."
                >
                  {(control) => (
                    <SegmentedControl
                      {...control}
                      label="Deliveries in the gift"
                      options={GIFT_LENGTHS.map((option) => ({
                        value: String(option),
                        label: String(option),
                      }))}
                      value={String(length)}
                      onValueChange={(next) => {
                        setLength(giftLengthFrom(next) ?? length);
                      }}
                    />
                  )}
                </Field>
              ) : null}
            </Morph>
          </Stack>
        </Surface>
        <Surface level="card" pad={6}>
          <Stack gap={6}>
            <div className="shop-plan-head">
              <Shelf
                label={coffee === "choice" ? "choice" : coffeeOf(coffee).label}
                className="shop-plan-art"
              />
              <Stack gap={3}>
                <Text variant="title-md">{planCoffeeName(coffee)}</Text>
                <Text variant="body-sm" tone="secondary">
                  {coffee === "choice"
                    ? "A different single origin each time, picked from what's roasting that week."
                    : `${notesOf(coffeeOf(coffee))}.`}
                </Text>
              </Stack>
            </div>
            <Stack gap={3}>
              <Text variant="title-lg" tabular>
                {money(price.dueToday)}
              </Text>
              <Text variant="body-sm" tone="secondary">
                {gift === null
                  ? `Per delivery: ${planSchedule({ bags: count, every })}, sent ${grindPhrase(grind)}.`
                  : `Today, for ${String(gift)} deliveries of ${bags(count)}, sent ${grindPhrase(grind)}.`}
              </Text>
            </Stack>
            <Inline>
              <StatusBadge tone="success">
                {`You save ${money(price.saving)} on every delivery`}
              </StatusBadge>
            </Inline>
            <Stack gap={3} asChild>
              <ul role="list">
                {PROMISES.map((promise) => (
                  <li key={promise.text} className="shop-promise">
                    <span className="shop-icon-line">
                      <Icon icon={promise.icon} />
                    </span>
                    <Text tone="secondary">{promise.text}</Text>
                  </li>
                ))}
              </ul>
            </Stack>
            <Button
              variant="primary"
              size="cta"
              shape="rounded"
              onClick={() => {
                addPlan({ coffee, bags: count, every, grind, gift });
              }}
            >
              {bag.plan === null
                ? "Add the subscription to your bag"
                : "Put this subscription in your bag"}
            </Button>
          </Stack>
        </Surface>
      </Grid>
    </Section>
  );
}
