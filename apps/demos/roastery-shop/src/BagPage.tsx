import type { ReactElement } from "react";
import { Inline, Stack, Surface, Text } from "@buttery/core";
import { ArrowLink, Button, EmptyState, Section } from "@buttery/react";
import { ShoppingBag } from "lucide-react";
import { bagCount, useBag } from "./bag.ts";
import { BagLines, FreeShipping } from "./BagLines.tsx";
import { Totals, orderTotals } from "./Checkout.tsx";
import { bags } from "./format.ts";
import { useSectionLink } from "./jump.ts";
import { PageIntro } from "./PageIntro.tsx";
import { useLink } from "./router.tsx";

/**
 * The bag on a page of its own, at `/bag`: what's in it, each line with its stepper and Remove, beside a
 * summary with the free-shipping progress, the totals and the way on to checkout. With nothing in it, it
 * says so and points to the coffees.
 */
export function BagPage({
  onChangePlan,
}: {
  /** Takes the customer to the subscription builder to change the subscription. */
  readonly onChangePlan: () => void;
}): ReactElement {
  const [bag, setBag] = useBag();
  const link = useLink();
  const section = useSectionLink();
  const count = bagCount(bag);

  if (count === 0) {
    return (
      <main id="main">
        <Section size="sm">
          <Surface level="card" pad={6}>
            <EmptyState
              icon={ShoppingBag}
              titleAs="h1"
              title="Your bag is empty"
              description="This week's coffee is a new harvest of Guji from Ethiopia: peach, jasmine and bergamot."
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
          title="Your bag"
          body={`${bags(count)} of coffee, roasted the morning after you order.`}
        />
        <div className="shop-bag-layout">
          <Surface level="card" pad={6}>
            <BagLines
              bag={bag}
              onBagChange={setBag}
              onChangePlan={onChangePlan}
            />
          </Surface>
          <Surface level="card" pad={6}>
            <Stack gap={5}>
              <Text variant="title-md" asChild>
                <h2>Order summary</h2>
              </Text>
              <FreeShipping bag={bag} />
              <Totals rows={orderTotals(bag, "standard")} />
              <Button
                variant="primary"
                size="cta"
                shape="rounded"
                arrow="forward"
                asChild
              >
                <a href={link("/checkout")}>Check out</a>
              </Button>
              <Inline>
                <ArrowLink arrow="back" {...section("coffees")}>
                  Keep shopping
                </ArrowLink>
              </Inline>
            </Stack>
          </Surface>
        </div>
      </Section>
    </main>
  );
}
