import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import { Button, IconButton } from "@buttery/react";
import { Minus, Plus } from "lucide-react";
import {
  MOST_OF_ONE,
  lineKey,
  lineTotal,
  removeLine,
  setPlan,
  setQuantity,
  subtotal,
} from "./bag.ts";
import type { Bag, CoffeeLine, Plan } from "./bag.ts";
import { Shelf } from "./BagArt.tsx";
import { coffeeOf, grindLabel, sizeLabel } from "./data.ts";
import { money } from "./format.ts";
import { planName, planSchedule } from "./plan.ts";
import {
  FREE_SHIPPING_FROM,
  bagPrice,
  freeShippingLeft,
  planPrice,
} from "./pricing.ts";

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

/** What's in the bag, each coffee with a stepper for how many bags, then the subscription, each removable. */
export function BagLines({
  bag,
  onBagChange,
  onChangePlan,
}: {
  readonly bag: Bag;
  readonly onBagChange: StoredStateSetter<Bag>;
  /** Takes the customer to the subscription builder to change the subscription. */
  readonly onChangePlan: () => void;
}): ReactElement {
  return (
    <ul role="list" className="shop-lines" aria-label="In your bag">
      {bag.lines.map((line) => (
        <LineRow key={lineKey(line)} line={line} onBagChange={onBagChange} />
      ))}
      {bag.plan === null ? null : (
        <PlanRow
          plan={bag.plan}
          onBagChange={onBagChange}
          onChange={onChangePlan}
        />
      )}
    </ul>
  );
}

/** How far the bag is from shipping free, in a line and a bar that fills as it gets there. */
export function FreeShipping({ bag }: { readonly bag: Bag }): ReactElement {
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
