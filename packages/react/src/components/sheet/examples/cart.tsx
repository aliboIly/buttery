import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, IconButton, Sheet, toast } from "@butteryui/react";
import { Minus, Plus, ShoppingBag } from "lucide-react";

interface Line {
  readonly id: string;
  readonly name: string;
  readonly grind: string;
  readonly cents: number;
  readonly quantity: number;
}

const LINES: readonly Line[] = [
  {
    id: "guji",
    name: "Guji, 12 oz",
    grind: "Whole bean",
    cents: 1900,
    quantity: 1,
  },
  {
    id: "huila",
    name: "Huila, 12 oz",
    grind: "Ground for drip",
    cents: 1700,
    quantity: 2,
  },
];

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function price(cents: number): string {
  return money.format(cents / 100);
}

function bags(count: number): string {
  return `${String(count)} ${count === 1 ? "bag" : "bags"}`;
}

/** A shop's bag: at the window's end on a laptop and rising from the bottom on a phone, its total and Check out in view. */
export function CartSheet(): ReactElement {
  const [lines, setLines] = useState(LINES);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = lines.reduce(
    (sum, line) => sum + line.cents * line.quantity,
    0,
  );
  const change = (id: string, quantity: number): void => {
    setLines(
      lines.map((line) => (line.id === id ? { ...line, quantity } : line)),
    );
  };
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button
          variant="primary"
          iconStart={ShoppingBag}
          aria-label={`Bag, ${bags(count)}`}
        >
          {`Bag ${String(count)}`}
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side={{ base: "bottom", md: "end" }}>
        <Sheet.Header
          title="Your bag"
          description={
            count === 0
              ? "Nothing in it yet."
              : `${bags(count)}, roasted the morning after you order.`
          }
        />
        <Sheet.Body>
          <Stack gap={4} asChild>
            <ul role="list" aria-label="In your bag">
              {lines.map((line) => (
                <li key={line.id}>
                  <Inline gap={4} align="start" justify="between">
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Text variant="label">{line.name}</Text>
                        <Text variant="body-sm" tone="secondary">
                          {`${line.grind} · ${price(line.cents)} each`}
                        </Text>
                      </Stack>
                      <Inline gap={1}>
                        <IconButton
                          icon={Minus}
                          size="sm"
                          label={`One bag fewer of ${line.name}`}
                          aria-disabled={line.quantity === 1}
                          onClick={() => {
                            change(line.id, line.quantity - 1);
                          }}
                        />
                        <Text variant="label" tabular aria-live="polite">
                          {line.quantity}
                        </Text>
                        <IconButton
                          icon={Plus}
                          size="sm"
                          label={`One bag more of ${line.name}`}
                          onClick={() => {
                            change(line.id, line.quantity + 1);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Remove ${line.name}`}
                          onClick={() => {
                            setLines(lines.filter(({ id }) => id !== line.id));
                          }}
                        >
                          Remove
                        </Button>
                      </Inline>
                    </Stack>
                    <Text variant="label" tabular>
                      {price(line.cents * line.quantity)}
                    </Text>
                  </Inline>
                </li>
              ))}
            </ul>
          </Stack>
        </Sheet.Body>
        <Sheet.Footer>
          <Inline gap={4} justify="between">
            <Text variant="label">Subtotal</Text>
            <Text variant="label" tabular>
              {price(subtotal)}
            </Text>
          </Inline>
          <Sheet.Close asChild>
            <Button
              variant="primary"
              size="cta"
              shape="rounded"
              aria-disabled={count === 0}
              onClick={() => {
                toast.success(
                  `Order placed: ${bags(count)}, ${price(subtotal)}`,
                );
              }}
            >
              Check out
            </Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Bag, 3 bags");
  await see("3 bags, roasted the morning after you order.");
  await press("button", "One bag more of Guji, 12 oz");
  await see("$38.00");
  await press("button", "Remove Huila, 12 oz");
  await see("2 bags, roasted the morning after you order.");
  await press("button", "Check out");
  await see("Order placed: 2 bags, $38.00");
};
