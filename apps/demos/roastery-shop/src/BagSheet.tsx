import type { MouseEvent, ReactElement } from "react";
import { Grid, opensElsewhere } from "@buttery/core";
import { Button, Sheet } from "@buttery/react";
import { bagCount, useBag } from "./bag.ts";
import { BagLines, FreeShipping } from "./BagLines.tsx";
import { Totals, orderTotals } from "./Checkout.tsx";
import { bags } from "./format.ts";
import { useLink } from "./router.tsx";

/**
 * The bag in a sheet, the way a store's cart opens: a side panel at the window's end on a laptop and a drawer
 * from the bottom on a phone. Its lines scroll above the free-shipping progress; the totals stay in view with
 * the ways on, to the bag's own page and to checkout, which close it as they go.
 */
export function BagSheet({
  open,
  onOpenChange,
  onShop,
  onChangePlan,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Closes the sheet and goes to the coffees, from an empty bag. */
  readonly onShop: () => void;
  /** Closes the sheet and goes to the subscription builder to change the subscription. */
  readonly onChangePlan: () => void;
}): ReactElement {
  const [bag, setBag] = useBag();
  const link = useLink();
  const count = bagCount(bag);
  const leave = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!opensElsewhere(event)) onOpenChange(false);
  };
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.Content
        side={{ base: "bottom", md: "end" }}
        className="shop-bag-sheet"
      >
        {count === 0 ? (
          <>
            <Sheet.Header
              title="Your bag is empty"
              description="This week's coffee is a new harvest of Guji from Ethiopia: peach, jasmine and bergamot."
            />
            <Sheet.Body>
              <Button
                variant="primary"
                size="cta"
                shape="rounded"
                arrow="forward"
                onClick={onShop}
              >
                Shop the coffees
              </Button>
            </Sheet.Body>
          </>
        ) : (
          <>
            <Sheet.Header
              title="Your bag"
              description={`${bags(count)} of coffee, roasted the morning after you order.`}
            />
            <Sheet.Body>
              <FreeShipping bag={bag} />
              <BagLines
                bag={bag}
                onBagChange={setBag}
                onChangePlan={onChangePlan}
              />
            </Sheet.Body>
            <Sheet.Footer>
              <Totals rows={orderTotals(bag, "standard")} />
              <Grid columns={2} gap={2}>
                <Button variant="soft" size="cta" shape="rounded" asChild>
                  <a href={link("/bag")} onClick={leave}>
                    View bag
                  </a>
                </Button>
                <Button
                  variant="primary"
                  size="cta"
                  shape="rounded"
                  arrow="forward"
                  asChild
                >
                  <a href={link("/checkout")} onClick={leave}>
                    Check out
                  </a>
                </Button>
              </Grid>
            </Sheet.Footer>
          </>
        )}
      </Sheet.Content>
    </Sheet>
  );
}
