import type { ReactElement } from "react";
import { Inline, Stack, Text, scrollToSection } from "@buttery/core";
import { ArrowLink, Button, MorphMenu, NavBar } from "@buttery/react";
import { ShoppingBag } from "lucide-react";
import { AccountAction } from "./Account.tsx";
import { Shelf } from "./BagArt.tsx";
import type { RoastFilter } from "./Coffees.tsx";
import { GUIDES, THIS_WEEK, coffeeOf } from "./data.ts";
import type { GuideId } from "./data.ts";
import { bags } from "./format.ts";
import { HalfmoonMark } from "./HalfmoonMark.tsx";
import { jump } from "./jump.ts";
import { useLink } from "./router.tsx";
import type { PlanFor } from "./Subscribe.tsx";

function BagButton({
  count,
  compact = false,
  onOpen,
}: {
  readonly count: number;
  /** Drops the word, leaving the icon and the count, for a narrow bar. */
  readonly compact?: boolean;
  readonly onOpen: () => void;
}): ReactElement {
  return (
    <Button
      variant="primary"
      iconStart={ShoppingBag}
      aria-label={`Bag, ${bags(count)}`}
      onClick={onOpen}
    >
      {compact ? null : "Bag "}
      <span className="shop-count">{count}</span>
    </Button>
  );
}

/**
 * The shop's bar: the brand, the Shop and Learn menus, Subscribe, and the account and bag actions. Folded
 * on a phone, the bag stays beside the brand while the rest moves into the menu sheet.
 */
export function ShopBar({
  count,
  onOpenBag,
  onSignIn,
  onCoffees,
  onPlan,
  onGuide,
}: {
  /** How many bags of coffee the bag holds. */
  readonly count: number;
  readonly onOpenBag: () => void;
  readonly onSignIn: () => void;
  /** Shows the coffees of one roast, or all of them. */
  readonly onCoffees: (roast: RoastFilter) => void;
  /** Sets the subscription builder up for the customer or for a gift. */
  readonly onPlan: (planFor: PlanFor) => void;
  readonly onGuide: (guide: GuideId) => void;
}): ReactElement {
  const link = useLink();
  const thisWeek = coffeeOf(THIS_WEEK);
  return (
    <NavBar
      skipTo="main"
      behavior="sticky"
      brand={
        <Inline gap={2}>
          <a href={link("/")}>
            <HalfmoonMark />
            Halfmoon
          </a>
          <span className="shop-brand-bag">
            <BagButton count={count} compact onOpen={onOpenBag} />
          </span>
        </Inline>
      }
      actions={
        <>
          <AccountAction
            onSignIn={onSignIn}
            onSubscription={() => {
              onPlan("me");
              scrollToSection("subscribe");
            }}
          />
          <BagButton count={count} onOpen={onOpenBag} />
        </>
      }
    >
      <MorphMenu.Item
        label="Shop"
        featured={
          <Stack gap={4} className="shop-menu-feature">
            <Shelf label={thisWeek.label} className="shop-menu-shelf" />
            <Stack gap={2}>
              <Text variant="control" tone="secondary">
                This week
              </Text>
              <Text variant="title">{`${thisWeek.name}, ${thisWeek.origin}`}</Text>
              <Text variant="body-sm" tone="secondary">
                A new harvest, just landed: peach, jasmine and bergamot.
              </Text>
            </Stack>
            <ArrowLink href="#this-week" onClick={jump("this-week")}>
              See this week's coffee
            </ArrowLink>
          </Stack>
        }
        footer={
          <ArrowLink
            href="#coffees"
            onClick={jump("coffees", () => {
              onCoffees("all");
            })}
          >
            Shop every coffee
          </ArrowLink>
        }
      >
        <MorphMenu.Column title="Coffee">
          <MorphMenu.Entry
            href="#coffees"
            onClick={jump("coffees", () => {
              onCoffees("Light");
            })}
            title="Light roasts"
            caption="Bright and fruity"
          />
          <MorphMenu.Entry
            href="#coffees"
            onClick={jump("coffees", () => {
              onCoffees("Medium");
            })}
            title="Medium roasts"
            caption="Caramel and chocolate"
          />
          <MorphMenu.Entry
            href="#coffees"
            onClick={jump("coffees", () => {
              onCoffees("Dark");
            })}
            title="Dark roasts"
            caption="Made for milk"
          />
        </MorphMenu.Column>
        <MorphMenu.Column title="Subscribe">
          <MorphMenu.Entry
            href="#subscribe"
            onClick={jump("subscribe", () => {
              onPlan("me");
            })}
            title="A subscription"
            caption="10% off, shipped free"
          />
          <MorphMenu.Entry
            href="#subscribe"
            onClick={jump("subscribe", () => {
              onPlan("gift");
            })}
            title="Give a subscription"
            caption="3, 6 or 12 deliveries"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item
        label="Learn"
        footer={
          <ArrowLink href="#brewing" onClick={jump("brewing")}>
            Every brew guide
          </ArrowLink>
        }
      >
        <MorphMenu.Column title="Brew guides">
          {GUIDES.map((guide) => (
            <MorphMenu.Entry
              key={guide.id}
              href="#brewing"
              onClick={jump("brewing", () => {
                onGuide(guide.id);
              })}
              title={guide.name}
              caption={`${String(guide.coffee)} g to ${String(guide.water)} g of water`}
            />
          ))}
        </MorphMenu.Column>
        <MorphMenu.Column title="The roastery">
          <MorphMenu.Entry
            href="#story"
            onClick={jump("story")}
            title="How we roast"
            caption="Five mornings a week"
          />
          <MorphMenu.Entry
            href="#story"
            onClick={jump("story")}
            title="Where it grows"
            caption="The farms behind each coffee"
          />
          <MorphMenu.Entry
            href="#questions"
            onClick={jump("questions")}
            title="Questions"
            caption="Shipping, grinding, storing"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link
        href="#subscribe"
        onClick={jump("subscribe", () => {
          onPlan("me");
        })}
      >
        Subscribe
      </MorphMenu.Link>
    </NavBar>
  );
}
