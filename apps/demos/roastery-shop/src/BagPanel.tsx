import { useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode, SubmitEvent } from "react";
import { Inline, Morph, Stack, Text, useStoredState } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import {
  Button,
  Dialog,
  IconButton,
  RadioCardGroup,
  TextField,
  looksLikeEmail,
} from "@buttery/react";
import { Minus, Plus } from "lucide-react";
import {
  EMPTY_BAG,
  MOST_OF_ONE,
  bagCount,
  lineKey,
  lineTotal,
  removeLine,
  setPlan,
  setQuantity,
  shippingFor,
  subtotal,
  totalFor,
  useBag,
} from "./bag.ts";
import type { Bag, CoffeeLine, Plan } from "./bag.ts";
import { Shelf } from "./BagArt.tsx";
import { coffeeOf, grindLabel, sizeLabel } from "./data.ts";
import { bags, money } from "./format.ts";
import { planName, planSchedule } from "./plan.ts";
import {
  FREE_SHIPPING_FROM,
  NEXT_DAY_SHIPPING,
  bagPrice,
  freeShippingLeft,
  planPrice,
  shippingCost,
} from "./pricing.ts";
import type { Delivery } from "./pricing.ts";
import { STORAGE_PREFIX } from "./storage.ts";

type Step = "bag" | "checkout" | "placed";

/** An order once it's placed, for the step that thanks the customer. */
interface PlacedOrder {
  readonly number: string;
  readonly email: string;
  readonly plan: Plan | null;
}

/** The first order number the shop gives out; each order placed in this browser takes the next one. */
const FIRST_ORDER = 10482;

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function Stepper({
  value,
  name,
  onChange,
}: {
  readonly value: number;
  readonly name: string;
  readonly onChange: (value: number) => void;
}): ReactElement {
  return (
    <div role="group" aria-label={`Bags of ${name}`} className="shop-stepper">
      <IconButton
        icon={Minus}
        label={`One bag fewer of ${name}`}
        size="sm"
        aria-disabled={value <= 1}
        onClick={() => {
          if (value > 1) onChange(value - 1);
        }}
      />
      <Text
        variant="label"
        tabular
        className="shop-quantity"
        aria-live="polite"
      >
        {value}
      </Text>
      <IconButton
        icon={Plus}
        label={`One bag more of ${name}`}
        size="sm"
        aria-disabled={value >= MOST_OF_ONE}
        onClick={() => {
          if (value < MOST_OF_ONE) onChange(value + 1);
        }}
      />
    </div>
  );
}

function LineRow({
  line,
  onBagChange,
}: {
  readonly line: CoffeeLine;
  readonly onBagChange: StoredStateSetter<Bag>;
}): ReactElement {
  const coffee = coffeeOf(line.coffee);
  const key = lineKey(line);
  const name = `${coffee.name}, ${sizeLabel(line.size)}`;
  return (
    <li className="shop-line">
      <Shelf label={coffee.label} className="shop-line-art" />
      <Stack gap={3}>
        <Stack gap={1}>
          <Text variant="label">{name}</Text>
          <Text variant="body-sm" tone="secondary">
            {`${grindLabel(line.grind)} · ${money(bagPrice(line.coffee, line.size))} each`}
          </Text>
        </Stack>
        <Inline gap={2}>
          <Stepper
            value={line.quantity}
            name={name}
            onChange={(quantity) => {
              onBagChange((bag) => setQuantity(bag, key, quantity));
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${name}`}
            onClick={() => {
              onBagChange((bag) => removeLine(bag, key));
            }}
          >
            Remove
          </Button>
        </Inline>
      </Stack>
      <Text variant="label" tabular className="shop-line-total">
        {money(lineTotal(line))}
      </Text>
    </li>
  );
}

function PlanRow({
  plan,
  onBagChange,
  onChange,
}: {
  readonly plan: Plan;
  readonly onBagChange: StoredStateSetter<Bag>;
  readonly onChange: () => void;
}): ReactElement {
  const price = planPrice(plan.coffee, plan.bags, plan.gift);
  const name = planName(plan);
  return (
    <li className="shop-line">
      <Shelf
        label={
          plan.coffee === "choice" ? "choice" : coffeeOf(plan.coffee).label
        }
        className="shop-line-art"
      />
      <Stack gap={3}>
        <Stack gap={1}>
          <Text variant="label">{name}</Text>
          <Text variant="body-sm" tone="secondary">
            {`${planSchedule(plan)} · ${grindLabel(plan.grind)}`}
          </Text>
        </Stack>
        <Inline gap={2}>
          <Button variant="ghost" size="sm" onClick={onChange}>
            Change
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${name}`}
            onClick={() => {
              onBagChange((bag) => setPlan(bag, null));
            }}
          >
            Remove
          </Button>
        </Inline>
      </Stack>
      <Text variant="label" tabular className="shop-line-total">
        {money(price.dueToday)}
      </Text>
    </li>
  );
}

function FreeShipping({ bag }: { readonly bag: Bag }): ReactElement {
  const hasPlan = bag.plan !== null;
  const sum = subtotal(bag);
  const left = freeShippingLeft(sum, hasPlan);
  const progress = hasPlan ? 1 : Math.min(1, sum / FREE_SHIPPING_FROM);
  return (
    <Stack gap={2}>
      <Text variant="body-sm" tone={left === 0 ? "default" : "secondary"}>
        {hasPlan
          ? "It all ships free with a subscription in your bag."
          : left === 0
            ? "Your order ships free."
            : `Add ${money(left)} more for free shipping.`}
      </Text>
      <div
        className="shop-progress"
        role="progressbar"
        aria-label="Toward free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuetext={
          left === 0
            ? "Free shipping"
            : `${money(sum)} of ${money(FREE_SHIPPING_FROM)}`
        }
      >
        <div
          className="shop-progress-fill"
          style={{ transform: `scaleX(${String(progress)})` }}
        />
      </div>
    </Stack>
  );
}

function Totals({
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

function shippingText(cost: number): string {
  return cost === 0 ? "Free" : money(cost);
}

function BagStep({
  bag,
  onBagChange,
  onCheckout,
  onShop,
  onChangePlan,
}: {
  readonly bag: Bag;
  readonly onBagChange: StoredStateSetter<Bag>;
  readonly onCheckout: () => void;
  readonly onShop: () => void;
  readonly onChangePlan: () => void;
}): ReactElement {
  const count = bagCount(bag);
  if (count === 0) {
    return (
      <>
        <Dialog.Text
          title="Your bag is empty"
          body="This week's coffee is a new harvest of Guji from Ethiopia: peach, jasmine and bergamot."
        />
        <Dialog.Actions>
          <Button
            variant="primary"
            size="cta"
            shape="rounded"
            arrow="forward"
            onClick={onShop}
          >
            Shop the coffees
          </Button>
        </Dialog.Actions>
      </>
    );
  }
  return (
    <>
      <Dialog.Text
        title="Your bag"
        body={`${bags(count)}, roasted the morning after you order.`}
      />
      <Dialog.Body>
        <ul role="list" className="shop-lines" aria-label="In your bag">
          {bag.lines.map((line) => (
            <LineRow
              key={lineKey(line)}
              line={line}
              onBagChange={onBagChange}
            />
          ))}
          {bag.plan === null ? null : (
            <PlanRow
              plan={bag.plan}
              onBagChange={onBagChange}
              onChange={onChangePlan}
            />
          )}
        </ul>
        <FreeShipping bag={bag} />
        <Totals
          rows={[
            ["Subtotal", money(subtotal(bag))],
            ["Shipping", shippingText(shippingFor(bag, "standard"))],
            ["Total", money(totalFor(bag, "standard"))],
          ]}
        />
      </Dialog.Body>
      <Dialog.Actions>
        <Button
          variant="primary"
          size="cta"
          shape="rounded"
          arrow="forward"
          onClick={onCheckout}
        >
          Check out
        </Button>
      </Dialog.Actions>
    </>
  );
}

function CheckoutStep({
  bag,
  email,
  onBack,
  onPlace,
}: {
  readonly bag: Bag;
  readonly email: string;
  readonly onBack: () => void;
  readonly onPlace: (email: string) => void;
}): ReactElement {
  const [address, setAddress] = useState(email);
  const [error, setError] = useState<string | undefined>(undefined);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const field = useRef<HTMLInputElement>(null);
  const standard = shippingCost(subtotal(bag), "standard", bag.plan !== null);

  useEffect(() => {
    field.current?.focus();
  }, []);

  const place = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const value = address.trim();
    if (value === "") {
      setError("Enter your email address, so we can send your receipt.");
      field.current?.focus();
      return;
    }
    if (!looksLikeEmail(value)) {
      setError("Enter an email address like name@example.com.");
      field.current?.focus();
      return;
    }
    onPlace(value);
  };

  return (
    <form onSubmit={place} noValidate>
      <Dialog.Text
        title="Check out"
        body="We roast your coffee the morning after you order, and email you when it ships."
      />
      <Dialog.Body>
        <TextField
          ref={field}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={address}
          error={error}
          onValueChange={(next) => {
            setAddress(next);
            setError(undefined);
          }}
        />
        <Stack gap={3}>
          <Text variant="label">Delivery</Text>
          <RadioCardGroup<Delivery>
            label="Delivery"
            value={delivery}
            onValueChange={setDelivery}
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
        <Totals
          rows={[
            ["Subtotal", money(subtotal(bag))],
            ["Shipping", shippingText(shippingFor(bag, delivery))],
            ["Total", money(totalFor(bag, delivery))],
          ]}
        />
      </Dialog.Body>
      <Dialog.Actions>
        <Button size="cta" shape="rounded" arrow="back" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" variant="primary" size="cta" shape="rounded">
          Place order
        </Button>
      </Dialog.Actions>
    </form>
  );
}

function PlacedStep({ order }: { readonly order: PlacedOrder }): ReactElement {
  const done = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    done.current?.focus();
  }, []);
  return (
    <>
      <Dialog.Text
        title="Thanks, your order is in"
        body={`Order ${order.number} goes into tomorrow morning's roast. We'll email ${order.email} when it ships.`}
        caption={
          order.plan === null
            ? undefined
            : order.plan.gift === null
              ? `Your subscription starts with this order: ${planSchedule(order.plan)}.`
              : `Your gift covers ${String(order.plan.gift)} deliveries, the first with this order.`
        }
      />
      <Dialog.Actions>
        <Dialog.Close asChild>
          <Button ref={done} variant="primary" size="cta" shape="rounded">
            Done
          </Button>
        </Dialog.Close>
      </Dialog.Actions>
    </>
  );
}

/**
 * The bag in a dialog that changes in place from what's in it, to checking out, to the order placed: one
 * surface whose height follows each step while the steps crossfade.
 */
export function BagPanel({
  open,
  onOpenChange,
  email,
  onShop,
  onChangePlan,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** The signed-in customer's email, which checkout fills in. */
  readonly email: string;
  readonly onShop: () => void;
  readonly onChangePlan: () => void;
}): ReactElement {
  const [bag, setBag] = useBag();
  const [orders, setOrders] = useStoredState(
    `${STORAGE_PREFIX}:orders`,
    0,
    isCount,
  );
  const [step, setStep] = useState<Step>("bag");
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStep("bag");
  }

  let content: ReactNode;
  switch (step) {
    case "bag":
      content = (
        <BagStep
          bag={bag}
          onBagChange={setBag}
          onCheckout={() => {
            setStep("checkout");
          }}
          onShop={onShop}
          onChangePlan={onChangePlan}
        />
      );
      break;
    case "checkout":
      content = (
        <CheckoutStep
          bag={bag}
          email={email}
          onBack={() => {
            setStep("bag");
          }}
          onPlace={(address) => {
            setPlaced({
              number: `HM-${String(FIRST_ORDER + orders)}`,
              email: address,
              plan: bag.plan,
            });
            setOrders(orders + 1);
            setBag(EMPTY_BAG);
            setStep("placed");
          }}
        />
      );
      break;
    case "placed":
      content = placed === null ? null : <PlacedStep order={placed} />;
      break;
    default: {
      const unknown: never = step;
      content = unknown;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="md">
        <Morph contentKey={step}>{content}</Morph>
      </Dialog.Content>
    </Dialog>
  );
}
