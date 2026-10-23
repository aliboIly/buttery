import type { ReactElement } from "react";
import {
  Grid,
  Icon,
  Stack,
  Surface,
  Text,
  opensElsewhere,
} from "@buttery/core";
import { ArrowLink, Button, MorphMenu, NavBar } from "@buttery/react";
import { ShoppingBag } from "lucide-react";
import { AccountAction } from "./Account.tsx";
import { Shelf, backdrop } from "./BagArt.tsx";
import type { RoastFilter } from "./Coffees.tsx";
import { GUIDES, ROAST_DAY, THIS_WEEK, coffeeOf } from "./data.ts";
import type { GuideId } from "./data.ts";
import { items } from "./format.ts";
import { HalfmoonMark } from "./HalfmoonMark.tsx";
import { useGoToSection, useSectionLink } from "./jump.ts";
import { useLink } from "./router.tsx";
import type { PlanFor } from "./Subscribe.tsx";

/**
 * The bag, its count in tabular figures: a link to the bag's page, so a middle click or ⌘-click opens it in
 * a new tab, that opens the bag's sheet on a plain click. On a narrow bar it drops the word.
 */
function BagLink({
  count,
  onOpen,
}: {
  readonly count: number;
  readonly onOpen: () => void;
}): ReactElement {
  const link = useLink();
  return (
    <Button variant="primary" iconStart={ShoppingBag} asChild>
      <a
        href={link("/bag")}
        aria-label={`Bag, ${items(count)}`}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (opensElsewhere(event)) return;
          event.preventDefault();
          onOpen();
        }}
      >
        <span className="shop-bag-word">Bag</span>{" "}
        <span className="shop-count">{count}</span>
      </a>
    </Button>
  );
}

/**
 * The shop's bar: the brand, the Shop and Learn menus, and the account and bag actions. Folded on a phone,
 * the bag stays in the bar, pinned beside the menu button, while the rest moves into the menu sheet. Its
 * links reach the front page's sections from any page.
 */
export function ShopBar({
  count,
  onOpenBag,
  onSignIn,
  onCoffees,
  onPlan,
  onGuide,
  onQuestion,
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
  /** Opens one of the questions customers ask, by id. */
  readonly onQuestion: (question: string) => void;
}): ReactElement {
  const link = useLink();
  const section = useSectionLink();
  const goTo = useGoToSection();
  const thisWeek = coffeeOf(THIS_WEEK);
  return (
    <NavBar
      skipTo="main"
      behavior="sticky"
      brand={
        <a href={link("/")}>
          <HalfmoonMark />
          Halfmoon
        </a>
      }
      actions={
        <AccountAction
          onSignIn={onSignIn}
          onSubscription={() => {
            onPlan("me");
            goTo("subscribe");
          }}
        />
      }
      pinned={<BagLink count={count} onOpen={onOpenBag} />}
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
            <ArrowLink {...section("this-week")}>
              See this week's coffee
            </ArrowLink>
          </Stack>
        }
        footer={
          <ArrowLink
            {...section("coffees", () => {
              onCoffees("all");
            })}
          >
            See all six coffees
          </ArrowLink>
        }
      >
        <MorphMenu.Column title="Coffee">
          <MorphMenu.Entry
            {...section("coffees", () => {
              onCoffees("Light");
            })}
            title="Light roasts"
            caption="Bright and fruity"
          />
          <MorphMenu.Entry
            {...section("coffees", () => {
              onCoffees("Medium");
            })}
            title="Medium roasts"
            caption="Caramel and chocolate"
          />
          <MorphMenu.Entry
            {...section("coffees", () => {
              onCoffees("Dark");
            })}
            title="Dark roasts"
            caption="Made for milk"
          />
        </MorphMenu.Column>
        <MorphMenu.Column title="Subscribe">
          <MorphMenu.Entry
            {...section("subscribe", () => {
              onPlan("me");
            })}
            title="Start a subscription"
            caption="10% off, shipped free"
          />
          <MorphMenu.Entry
            {...section("subscribe", () => {
              onPlan("gift");
            })}
            title="Give a subscription"
            caption="3, 6 or 12 deliveries"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item
        label="Learn"
        featured={
          <Stack gap={4} className="shop-menu-feature">
            <div
              className="shop-shelf shop-backdrop"
              style={backdrop({ light: "cream", dark: "espresso" })}
            >
              <Surface level="card" pad={3} className="shop-menu-day">
                <Grid columns={4} gap={2} asChild>
                  <ul role="list">
                    {ROAST_DAY.map((moment) => (
                      <Stack key={moment.step} gap={2} align="center" asChild>
                        <li>
                          <Icon icon={moment.icon} />
                          <Stack gap={1} align="center">
                            <Text variant="label">{moment.step}</Text>
                            <Text variant="caption" tone="secondary" tabular>
                              {moment.time}
                            </Text>
                          </Stack>
                        </li>
                      </Stack>
                    ))}
                  </ul>
                </Grid>
              </Surface>
            </div>
            <Stack gap={2}>
              <Text variant="control" tone="secondary">
                The roastery
              </Text>
              <Text variant="title">Out the door by four</Text>
              <Text variant="body-sm" tone="secondary">
                Roasted at seven, rested, packed and shipped the same day.
              </Text>
            </Stack>
            <ArrowLink {...section("story")}>See how we roast</ArrowLink>
          </Stack>
        }
        footer={<ArrowLink {...section("brewing")}>All brew guides</ArrowLink>}
      >
        <MorphMenu.Column title="Brew guides">
          {GUIDES.map((guide) => (
            <MorphMenu.Entry
              key={guide.id}
              {...section("brewing", () => {
                onGuide(guide.id);
              })}
              title={guide.name}
              caption={`${String(guide.coffee)} g coffee, ${String(guide.water)} g water`}
            />
          ))}
        </MorphMenu.Column>
        <MorphMenu.Column title="Questions">
          <MorphMenu.Entry
            {...section("questions", () => {
              onQuestion("arrival");
            })}
            title="Shipping"
            caption="When your coffee arrives"
          />
          <MorphMenu.Entry
            {...section("questions", () => {
              onQuestion("returns");
            })}
            title="Returns"
            caption="If a coffee isn't for you"
          />
          <MorphMenu.Entry
            {...section("questions", () => {
              onQuestion("storage");
            })}
            title="Storing coffee"
            caption="Keeping a bag at its best"
          />
          <MorphMenu.Entry
            href="mailto:hello@halfmoon.example"
            title="Write to us"
            caption="hello@halfmoon.example"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
    </NavBar>
  );
}
