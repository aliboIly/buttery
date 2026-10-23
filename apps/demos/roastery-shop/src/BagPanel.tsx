import { useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import { Inline, Morph, Stack, Text, useStoredState } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import { Button, Dialog, IconButton } from "@buttery/react";
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
  subtotal,
  useBag,
} from "./bag.ts";
import type { Bag, CoffeeLine, Plan } from "./bag.ts";
import { Shelf } from "./BagArt.tsx";
import { coffeeOf, grindLabel, sizeLabel } from "./data.ts";
import { PaymentStep, ShippingStep, Totals, orderTotals } from "./Checkout.tsx";
import { EMPTY_ADDRESS, EMPTY_CARD } from "./order-details.ts";
import type { Address, Card } from "./order-details.ts";
import { bags, money } from "./format.ts";
import { firstName, planName, planSchedule } from "./plan.ts";
import {
  FREE_SHIPPING_FROM,
  bagPrice,
  freeShippingLeft,
  planPrice,
} from "./pricing.ts";
import type { Delivery } from "./pricing.ts";
import { STORAGE_PREFIX } from "./storage.ts";

type Step = "bag" | "shipping" | "payment" | "placed";

/** An order once it's placed, for the step that thanks the customer. */
interface PlacedOrder {
  readonly number: string;
  readonly address: Address;
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
        body={`${bags(count)} of coffee, roasted the morning after you order.`}
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
        <Totals rows={orderTotals(bag, "standard")} />
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

function PlacedStep({ order }: { readonly order: PlacedOrder }): ReactElement {
  const done = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    done.current?.focus();
  }, []);
  const { address, plan } = order;
  return (
    <>
      <Dialog.Text
        title="Thanks, your order is in"
        body={`Order ${order.number} goes into tomorrow morning's roast and ships to ${firstName(address.name)} in ${address.city.trim()}. We'll email ${address.email.trim()} when it's on its way.`}
        caption={
          plan === null
            ? undefined
            : plan.recipient === null
              ? `Your subscription starts with this order: ${planSchedule(plan)}.`
              : `${firstName(plan.recipient.name)}'s gift starts with this order: ${String(plan.gift ?? 1)} deliveries, ${planSchedule(plan)}.`
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
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [card, setCard] = useState<Card>(EMPTY_CARD);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("bag");
      if (address.email === "") setAddress({ ...address, email });
    }
  }

  let content: ReactNode;
  switch (step) {
    case "bag":
      content = (
        <BagStep
          bag={bag}
          onBagChange={setBag}
          onCheckout={() => {
            setStep("shipping");
          }}
          onShop={onShop}
          onChangePlan={onChangePlan}
        />
      );
      break;
    case "shipping":
      content = (
        <ShippingStep
          bag={bag}
          address={address}
          onAddressChange={setAddress}
          delivery={delivery}
          onDeliveryChange={setDelivery}
          onBack={() => {
            setStep("bag");
          }}
          onContinue={() => {
            setStep("payment");
          }}
        />
      );
      break;
    case "payment":
      content = (
        <PaymentStep
          bag={bag}
          delivery={delivery}
          card={card}
          onCardChange={setCard}
          onBack={() => {
            setStep("shipping");
          }}
          onPay={() => {
            setPlaced({
              number: `HM-${String(FIRST_ORDER + orders)}`,
              address,
              plan: bag.plan,
            });
            setOrders(orders + 1);
            setBag(EMPTY_BAG);
            setCard(EMPTY_CARD);
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
      <Dialog.Content size="md" className="shop-dialog">
        <Morph contentKey={step}>{content}</Morph>
      </Dialog.Content>
    </Dialog>
  );
}
