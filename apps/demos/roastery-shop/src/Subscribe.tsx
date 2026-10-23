import { useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  Grid,
  Icon,
  Inline,
  Morph,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import {
  Button,
  Field,
  Section,
  SegmentedControl,
  Select,
  StatusBadge,
  TextField,
  looksLikeEmail,
} from "@butteryui/react";
import {
  CalendarCheck,
  CalendarClock,
  Gift,
  Repeat,
  Truck,
} from "lucide-react";
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

interface Perk {
  readonly icon: LucideIcon;
  readonly text: string;
}

const PERKS: Readonly<Record<PlanFor, readonly Perk[]>> = {
  me: [
    { icon: Truck, text: "Free shipping on each delivery" },
    {
      icon: CalendarClock,
      text: "Skip or pause up to the day before it roasts",
    },
    { icon: Repeat, text: "Change the coffee whenever you like" },
  ],
  gift: [
    { icon: Gift, text: "We email them a card when the first bag ships" },
    { icon: Truck, text: "Free shipping on each delivery" },
    {
      icon: CalendarCheck,
      text: "Stops after the last delivery, with nothing to cancel",
    },
  ],
};

/** What's wrong with a gift's recipient, by field, while anything is. */
interface RecipientErrors {
  readonly name?: string;
  readonly email?: string;
}

function recipientErrors(name: string, email: string): RecipientErrors {
  return {
    ...(name === "" ? { name: "Enter the name of the person it's for." } : {}),
    ...(email === ""
      ? { email: "Enter their email, so we can tell them it's coming." }
      : looksLikeEmail(email)
        ? {}
        : { email: "Enter an email address like name@example.com." }),
  };
}

/**
 * The subscription builder: who it's for, and for a gift who gets it and how many deliveries, then how
 * often, how many bags, which coffee and grind, with the price following each choice.
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<RecipientErrors>({});
  const nameField = useRef<HTMLInputElement>(null);
  const emailField = useRef<HTMLInputElement>(null);
  const [bag] = useBag();
  const { addPlan } = useAddToBag();
  const gift = planFor === "gift" ? length : null;
  const price = planPrice(coffee, count, gift);
  const schedule = planSchedule({ bags: count, every });

  const add = (): void => {
    if (gift === null) {
      addPlan({ coffee, bags: count, every, grind, gift, recipient: null });
      return;
    }
    const recipient = { name: name.trim(), email: email.trim() };
    const problems = recipientErrors(recipient.name, recipient.email);
    setErrors(problems);
    if (problems.name !== undefined) nameField.current?.focus();
    else if (problems.email !== undefined) emailField.current?.focus();
    else addPlan({ coffee, bags: count, every, grind, gift, recipient });
  };

  return (
    <Section
      id="subscribe"
      tone="muted"
      title="Never run out"
      body="Choose how often and how much. We roast each delivery fresh and take 10% off every bag."
    >
      <Grid columns={{ base: 1, lg: 2 }} gap={4}>
        <Surface level="card" pad={6}>
          <Stack gap={5}>
            <div>
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
              <Morph contentKey={planFor}>
                {planFor === "gift" ? (
                  <Stack gap={5} className="shop-gift">
                    <Grid columns={{ base: 1, md: 2 }} gap={4}>
                      <TextField
                        ref={nameField}
                        label="Their name"
                        autoComplete="off"
                        value={name}
                        error={errors.name}
                        onValueChange={(next) => {
                          setName(next);
                          setErrors((current) =>
                            current.email === undefined
                              ? {}
                              : { email: current.email },
                          );
                        }}
                      />
                      <TextField
                        ref={emailField}
                        label="Their email"
                        type="email"
                        autoComplete="off"
                        inputMode="email"
                        value={email}
                        error={errors.email}
                        onValueChange={(next) => {
                          setEmail(next);
                          setErrors((current) =>
                            current.name === undefined
                              ? {}
                              : { name: current.name },
                          );
                        }}
                      />
                    </Grid>
                    <Field label="Deliveries in the gift">
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
                  </Stack>
                ) : null}
              </Morph>
            </div>
            <Field label="Delivered every">
              {(control) => (
                <SegmentedControl<Frequency>
                  {...control}
                  label="Delivered every"
                  options={FREQUENCIES}
                  value={every}
                  onValueChange={setEvery}
                />
              )}
            </Field>
            <Field
              label="Bags each time"
              hint="A 12 oz bag makes about 20 cups."
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
          </Stack>
        </Surface>
        <Surface level="card" pad={6}>
          <Stack gap={5} justify="between" className="shop-plan-summary">
            <Stack gap={5}>
              <div className="shop-plan-head">
                <Shelf
                  label={
                    coffee === "choice" ? "choice" : coffeeOf(coffee).label
                  }
                  className="shop-plan-art"
                />
                <Stack gap={3}>
                  <Text variant="title-md">{planCoffeeName(coffee)}</Text>
                  <Text variant="body-sm" tone="secondary">
                    {coffee === "choice"
                      ? "A different single origin each time, from what's roasting that week."
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
                    ? `Each delivery: ${schedule}, ${grindPhrase(grind)}.`
                    : `Paid today for ${String(gift)} deliveries: ${schedule}, ${grindPhrase(grind)}.`}
                </Text>
                <Inline>
                  <StatusBadge tone="success">
                    {`You save ${money(price.saving)} a delivery`}
                  </StatusBadge>
                </Inline>
              </Stack>
              <Stack gap={2} asChild>
                <ul role="list">
                  {PERKS[planFor].map((perk) => (
                    <li key={perk.text} className="shop-perk">
                      <span className="shop-icon-line">
                        <Icon icon={perk.icon} />
                      </span>
                      <Text tone="secondary">{perk.text}</Text>
                    </li>
                  ))}
                </ul>
              </Stack>
            </Stack>
            <Button variant="primary" size="cta" shape="rounded" onClick={add}>
              {bag.plan !== null
                ? "Replace the subscription in your bag"
                : gift === null
                  ? "Add the subscription to your bag"
                  : "Add the gift to your bag"}
            </Button>
          </Stack>
        </Surface>
      </Grid>
    </Section>
  );
}
