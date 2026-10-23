import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  Inline,
  Morph,
  Stack,
  Surface,
  Text,
  TextStack,
  useStoredState,
} from "@buttery/core";
import { ArrowLink, Button, EmptyState, Section } from "@buttery/react";
import { ShoppingBag } from "lucide-react";
import { EMPTY_BAG, bagCount, lineKey, lineTotal, useBag } from "./bag.ts";
import type { Bag, Plan } from "./bag.ts";
import { PaymentStep, ShippingStep, Totals, orderTotals } from "./Checkout.tsx";
import { coffeeOf, sizeLabel } from "./data.ts";
import { money } from "./format.ts";
import { useSectionLink } from "./jump.ts";
import { PageIntro } from "./PageIntro.tsx";
import { EMPTY_CARD } from "./order-details.ts";
import type { Address, Card } from "./order-details.ts";
import { firstName, planName, planSchedule } from "./plan.ts";
import { planPrice } from "./pricing.ts";
import type { Delivery } from "./pricing.ts";
import { useLink } from "./router.tsx";
import { STORAGE_PREFIX } from "./storage.ts";

type Step = "shipping" | "payment" | "placed";

/** An order once it's placed, for the page that thanks the customer. */
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

/** What's being ordered, line by line, with the totals for the way it ships and a way back to the bag. */
function OrderSummary({
  bag,
  delivery,
}: {
  readonly bag: Bag;
  readonly delivery: Delivery;
}): ReactElement {
  const link = useLink();
  return (
    <Stack gap={5}>
      <Text variant="title-md" asChild>
        <h2>Your order</h2>
      </Text>
      <Stack gap={3} asChild>
        <ul role="list" aria-label="What you're ordering">
          {bag.lines.map((line) => (
            <li key={lineKey(line)} className="shop-summary-line">
              <Text variant="body-sm">
                {`${coffeeOf(line.coffee).name}, ${sizeLabel(line.size)} × ${String(line.quantity)}`}
              </Text>
              <Text variant="body-sm" tabular>
                {money(lineTotal(line))}
              </Text>
            </li>
          ))}
          {bag.plan === null ? null : (
            <li className="shop-summary-line">
              <Text variant="body-sm">{planName(bag.plan)}</Text>
              <Text variant="body-sm" tabular>
                {money(
                  planPrice(bag.plan.coffee, bag.plan.bags, bag.plan.gift)
                    .dueToday,
                )}
              </Text>
            </li>
          )}
        </ul>
      </Stack>
      <Totals rows={orderTotals(bag, delivery)} />
      <Inline>
        <ArrowLink href={link("/bag")} arrow="back">
          Change your bag
        </ArrowLink>
      </Inline>
    </Stack>
  );
}

/** The thanks once the order is placed: its number, where it ships and when, and the way back to the shop. */
function Placed({ order }: { readonly order: PlacedOrder }): ReactElement {
  const link = useLink();
  const back = useRef<HTMLAnchorElement>(null);
  // The Pay button that placed the order has gone, so focus moves on to what comes next.
  useEffect(() => {
    back.current?.focus();
  }, []);
  const { address, plan } = order;
  return (
    <Surface level="card" pad={6} className="shop-placed">
      <Stack gap={6}>
        <TextStack
          size="feature"
          titleAs="h1"
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
        <Inline>
          <Button variant="primary" size="cta" shape="rounded" asChild>
            <a ref={back} href={link("/")}>
              Back to the shop
            </a>
          </Button>
        </Inline>
      </Stack>
    </Surface>
  );
}

/**
 * Checking out on a page of its own, at `/checkout`: the shipping form, then payment, in one card whose
 * height follows each step while the steps crossfade, beside what's being ordered; then the thanks once the
 * order is placed. With nothing in the bag it says so and points back to the coffees.
 */
export function CheckoutPage({
  address,
  onAddressChange,
  delivery,
  onDeliveryChange,
}: {
  /** Where the order goes, kept by the shop so it's still filled in after a trip back to the bag. */
  readonly address: Address;
  readonly onAddressChange: (address: Address) => void;
  readonly delivery: Delivery;
  readonly onDeliveryChange: (delivery: Delivery) => void;
}): ReactElement {
  const [bag, setBag] = useBag();
  const [orders, setOrders] = useStoredState(
    `${STORAGE_PREFIX}:orders`,
    0,
    isCount,
  );
  const [step, setStep] = useState<Step>("shipping");
  const [card, setCard] = useState<Card>(EMPTY_CARD);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);
  const section = useSectionLink();

  if (step === "placed" && placed !== null) {
    return (
      <main id="main">
        <Section size="sm">
          <Placed order={placed} />
        </Section>
      </main>
    );
  }

  if (bagCount(bag) === 0) {
    return (
      <main id="main">
        <Section size="sm">
          <Surface level="card" pad={6}>
            <EmptyState
              icon={ShoppingBag}
              titleAs="h1"
              title="Nothing to check out yet"
              description="Your bag is empty. This week's coffee is a new harvest of Guji from Ethiopia."
              actions={
                <Button variant="primary" arrow="forward" asChild>
                  <a {...section("coffees")}>Shop the coffees</a>
                </Button>
              }
            />
          </Surface>
        </Section>
      </main>
    );
  }

  return (
    <main id="main">
      <Section size="sm">
        <PageIntro
          title="Check out"
          body="Order by noon and we roast it tomorrow morning."
        />
        <div className="shop-checkout-layout">
          <Surface level="card" pad={6}>
            <Morph contentKey={step}>
              {step === "payment" ? (
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
              ) : (
                <ShippingStep
                  bag={bag}
                  address={address}
                  onAddressChange={onAddressChange}
                  delivery={delivery}
                  onDeliveryChange={onDeliveryChange}
                  onContinue={() => {
                    setStep("payment");
                  }}
                />
              )}
            </Morph>
          </Surface>
          <Surface level="card" pad={6}>
            <OrderSummary bag={bag} delivery={delivery} />
          </Surface>
        </div>
      </Section>
    </main>
  );
}
