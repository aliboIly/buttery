import { useEffect, useId, useRef, useState } from "react";
import type { ReactElement, RefObject, SubmitEvent } from "react";
import { Grid, Stack, Text, TextStack } from "@butteryui/core";
import { Button, RadioCardGroup, TextField } from "@butteryui/react";
import { shippingFor, subtotal, totalFor } from "./bag.ts";
import type { Bag } from "./bag.ts";
import { money } from "./format.ts";
import { addressProblems, cardProblems, isClear } from "./order-details.ts";
import type { Address, Card, Problems } from "./order-details.ts";
import {
  FREE_SHIPPING_FROM,
  NEXT_DAY_SHIPPING,
  shippingCost,
} from "./pricing.ts";
import type { Delivery } from "./pricing.ts";
import { useLink } from "./router.tsx";

/** An order's totals as rows of a list, the last one, the total, set apart. */
export function Totals({
  rows,
}: {
  readonly rows: readonly (readonly [string, string])[];
}): ReactElement {
  const last = rows.length - 1;
  return (
    <dl className="shop-totals">
      {rows.map(([term, value], index) => (
        <div
          key={term}
          className="shop-total"
          data-grand={index === last ? "" : undefined}
        >
          <Text variant={index === last ? "label" : "body-sm"} asChild>
            <dt>{term}</dt>
          </Text>
          <Text variant={index === last ? "label" : "body-sm"} tabular asChild>
            <dd>{value}</dd>
          </Text>
        </div>
      ))}
    </dl>
  );
}

/** The order's subtotal, shipping and total for a way of delivering it. */
export function orderTotals(
  bag: Bag,
  delivery: Delivery,
): readonly (readonly [string, string])[] {
  const shipping = shippingFor(bag, delivery);
  return [
    ["Subtotal", money(subtotal(bag))],
    ["Shipping", shipping === 0 ? "Free" : money(shipping)],
    ["Total", money(totalFor(bag, delivery))],
  ];
}

/** Focuses a step's first field as it arrives, since the button that moved on to it has gone. */
function useFocusOnArrival(field: RefObject<HTMLInputElement | null>): void {
  useEffect(() => {
    field.current?.focus();
  }, [field]);
}

/** Puts focus on the first field, in the form's order, that a submit found something wrong with. */
function focusFirstProblem<Form>(
  form: HTMLFormElement,
  problems: Problems<Form>,
  order: readonly (keyof Form & string)[],
): void {
  const first = order.find((key) => problems[key] !== undefined);
  if (first === undefined) return;
  const field = form.elements.namedItem(first);
  if (field instanceof HTMLInputElement) field.focus();
}

const ADDRESS_ORDER: readonly (keyof Address)[] = [
  "email",
  "name",
  "street",
  "unit",
  "city",
  "state",
  "zip",
];

/**
 * Where the order goes and how fast: the email for the receipt, the address and the delivery speed, with a
 * way back to the bag.
 */
export function ShippingStep({
  bag,
  address,
  onAddressChange,
  delivery,
  onDeliveryChange,
  onContinue,
}: {
  readonly bag: Bag;
  readonly address: Address;
  readonly onAddressChange: (address: Address) => void;
  readonly delivery: Delivery;
  readonly onDeliveryChange: (delivery: Delivery) => void;
  readonly onContinue: () => void;
}): ReactElement {
  const link = useLink();
  const titleId = useId();
  const [tried, setTried] = useState(false);
  const problems: Problems<Address> = tried ? addressProblems(address) : {};
  const email = useRef<HTMLInputElement>(null);
  useFocusOnArrival(email);
  const standard = shippingCost(subtotal(bag), "standard", bag.plan !== null);
  const change =
    (key: keyof Address) =>
    (value: string): void => {
      onAddressChange({ ...address, [key]: value });
    };
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTried(true);
    const found = addressProblems(address);
    if (isClear(found)) onContinue();
    else focusFirstProblem(event.currentTarget, found, ADDRESS_ORDER);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={titleId}
      className="shop-checkout"
    >
      <Stack gap={6}>
        <TextStack
          title={<span id={titleId}>Shipping</span>}
          body="We email your receipt now, and again when it ships."
        />
        <div className="shop-address">
          <TextField
            ref={email}
            name="email"
            label="Email"
            type="email"
            size="lg"
            autoComplete="email"
            inputMode="email"
            value={address.email}
            error={problems.email}
            onValueChange={change("email")}
          />
          <TextField
            name="name"
            label="Full name"
            size="lg"
            autoComplete="name"
            value={address.name}
            error={problems.name}
            onValueChange={change("name")}
          />
          <TextField
            name="street"
            label="Street address"
            size="lg"
            autoComplete="address-line1"
            value={address.street}
            error={problems.street}
            onValueChange={change("street")}
          />
          <TextField
            name="unit"
            label="Apartment, suite (optional)"
            size="lg"
            autoComplete="address-line2"
            value={address.unit}
            onValueChange={change("unit")}
          />
          <TextField
            name="city"
            label="City"
            size="lg"
            autoComplete="address-level2"
            value={address.city}
            error={problems.city}
            onValueChange={change("city")}
          />
          <Grid columns={2} gap={4}>
            <TextField
              name="state"
              label="State"
              size="lg"
              autoComplete="address-level1"
              maxLength={2}
              value={address.state}
              error={problems.state}
              onValueChange={change("state")}
            />
            <TextField
              name="zip"
              label="ZIP code"
              size="lg"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={10}
              value={address.zip}
              error={problems.zip}
              onValueChange={change("zip")}
            />
          </Grid>
        </div>
        <Stack gap={3}>
          <Text variant="label">Delivery speed</Text>
          <RadioCardGroup<Delivery>
            label="Delivery speed"
            value={delivery}
            onValueChange={onDeliveryChange}
            options={[
              {
                value: "standard",
                label: "Standard, 2 to 4 days",
                description:
                  standard === 0
                    ? "Free"
                    : `${money(standard)}, free from ${money(FREE_SHIPPING_FROM)}`,
              },
              {
                value: "next-day",
                label: "Next day",
                description: `${money(NEXT_DAY_SHIPPING)}, the day after it's roasted`,
              },
            ]}
          />
        </Stack>
        <Grid columns={2} gap={2}>
          <Button
            variant="soft"
            size="cta"
            shape="rounded"
            arrow="back"
            asChild
          >
            <a href={link("/bag")}>Bag</a>
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="cta"
            shape="rounded"
            arrow="forward"
          >
            Payment
          </Button>
        </Grid>
      </Stack>
    </form>
  );
}

const CARD_ORDER: readonly (keyof Card)[] = ["number", "expiry", "code"];

/** Paying for the order: the card, on a button that says the total it's charged. */
export function PaymentStep({
  bag,
  delivery,
  card,
  onCardChange,
  onBack,
  onPay,
}: {
  readonly bag: Bag;
  readonly delivery: Delivery;
  readonly card: Card;
  readonly onCardChange: (card: Card) => void;
  readonly onBack: () => void;
  readonly onPay: () => void;
}): ReactElement {
  const titleId = useId();
  const [tried, setTried] = useState(false);
  const problems: Problems<Card> = tried ? cardProblems(card) : {};
  const number = useRef<HTMLInputElement>(null);
  useFocusOnArrival(number);
  const change =
    (key: keyof Card) =>
    (value: string): void => {
      onCardChange({ ...card, [key]: value });
    };
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setTried(true);
    const found = cardProblems(card);
    if (isClear(found)) onPay();
    else focusFirstProblem(event.currentTarget, found, CARD_ORDER);
  };

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={titleId}
      className="shop-checkout"
    >
      <Stack gap={6}>
        <TextStack
          title={<span id={titleId}>Payment</span>}
          body="Nothing is charged in this demo shop, and the card isn't kept."
        />
        <TextField
          ref={number}
          name="number"
          label="Card number"
          hint="Any 16 digits will do."
          size="lg"
          autoComplete="cc-number"
          inputMode="numeric"
          maxLength={23}
          value={card.number}
          error={problems.number}
          onValueChange={change("number")}
        />
        <Grid columns={2} gap={4}>
          <TextField
            name="expiry"
            label="Expiry"
            hint="MM/YY"
            size="lg"
            autoComplete="cc-exp"
            inputMode="numeric"
            maxLength={7}
            value={card.expiry}
            error={problems.expiry}
            onValueChange={change("expiry")}
          />
          <TextField
            name="code"
            label="Security code"
            hint="On the back"
            size="lg"
            autoComplete="cc-csc"
            inputMode="numeric"
            maxLength={4}
            value={card.code}
            error={problems.code}
            onValueChange={change("code")}
          />
        </Grid>
        <Grid columns={2} gap={2}>
          <Button
            variant="soft"
            size="cta"
            shape="rounded"
            arrow="back"
            onClick={onBack}
          >
            Shipping
          </Button>
          <Button type="submit" variant="primary" size="cta" shape="rounded">
            {`Pay ${money(totalFor(bag, delivery))}`}
          </Button>
        </Grid>
      </Stack>
    </form>
  );
}
