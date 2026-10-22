import { useState } from "react";
import type { MouseEvent, ReactElement } from "react";
import { Inline, Stack, Text, scrollToSection } from "@buttery/core";
import {
  ArrowLink,
  Button,
  Footer,
  LogoStrip,
  MorphMenu,
  NavBar,
  Page,
  Section,
  SplitHero,
  SubNav,
} from "@buttery/react";
import { ShoppingBag } from "lucide-react";
import { AccountAction, SignInDialog, useAccount } from "./Account.tsx";
import { Shelf } from "./BagArt.tsx";
import { BagPanel } from "./BagPanel.tsx";
import { bagCount, useBag } from "./bag.ts";
import { Brewing } from "./Brewing.tsx";
import { Coffees } from "./Coffees.tsx";
import type { OriginFilter, RoastFilter } from "./Coffees.tsx";
import { CAFES, GUIDES, THIS_WEEK, coffeeOf } from "./data.ts";
import type { CoffeeId, GuideId } from "./data.ts";
import { bags } from "./format.ts";
import { HalfmoonMark } from "./HalfmoonMark.tsx";
import { Newsletter } from "./Newsletter.tsx";
import { Questions } from "./Questions.tsx";
import { ShopContext } from "./shop-context.ts";
import { Story } from "./Story.tsx";
import { Subscribe } from "./Subscribe.tsx";
import type { PlanFor } from "./Subscribe.tsx";
import { ThisWeek } from "./ThisWeek.tsx";
import { useLink } from "./router.tsx";

const SECTIONS = [
  { id: "this-week", label: "This week" },
  { id: "coffees", label: "Coffees" },
  { id: "subscribe", label: "Subscribe" },
  { id: "story", label: "Our story" },
  { id: "brewing", label: "Brewing" },
  { id: "questions", label: "Questions" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"] | "letter";

/** A link that jumps to a section of the page under the sticky bars, leaving the address alone. */
function jump(
  id: SectionId,
  before?: () => void,
): (event: MouseEvent<HTMLAnchorElement>) => void {
  return (event) => {
    before?.();
    if (scrollToSection(id)) event.preventDefault();
  };
}

function Brand(): ReactElement {
  const link = useLink();
  return (
    <a href={link("/")}>
      <HalfmoonMark />
      Halfmoon
    </a>
  );
}

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
 * Halfmoon Roastery's online shop: this week's coffee, the six coffees, a subscription builder, how the
 * roastery works, brew guides and the questions customers ask, with a bag that checks out in place.
 */
export function Shop(): ReactElement {
  const [bag] = useBag();
  const [account] = useAccount();
  const [bagOpen, setBagOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [roast, setRoast] = useState<RoastFilter>("all");
  const [origin, setOrigin] = useState<OriginFilter>("all");
  const [openCoffee, setOpenCoffee] = useState<CoffeeId | null>(null);
  const [planFor, setPlanFor] = useState<PlanFor>("me");
  const [guide, setGuide] = useState<GuideId>("pour-over");
  const [questions, setQuestions] = useState<readonly string[]>([]);
  const count = bagCount(bag);

  const openBag = (): void => {
    setOpenCoffee(null);
    setBagOpen(true);
  };
  const showCoffee = (coffee: CoffeeId): void => {
    setRoast("all");
    setOrigin("all");
    scrollToSection("coffees");
    setOpenCoffee(coffee);
  };
  const coffees =
    (filter: RoastFilter): (() => void) =>
    () => {
      setRoast(filter);
      setOrigin("all");
    };
  const plan =
    (who: PlanFor): (() => void) =>
    () => {
      setPlanFor(who);
    };
  const brew =
    (id: GuideId): (() => void) =>
    () => {
      setGuide(id);
    };
  const thisWeek = coffeeOf(THIS_WEEK);

  return (
    <ShopContext value={{ openBag, showCoffee }}>
      <Page data-testid="roastery-shop">
        <NavBar
          skipTo="main"
          behavior="sticky"
          brand={
            <Inline gap={2}>
              <Brand />
              <span className="shop-brand-bag">
                <BagButton count={count} compact onOpen={openBag} />
              </span>
            </Inline>
          }
          actions={
            <>
              <AccountAction
                onSignIn={() => {
                  setSigningIn(true);
                }}
                onSubscription={() => {
                  scrollToSection("subscribe");
                }}
              />
              <BagButton count={count} onOpen={openBag} />
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
                onClick={jump("coffees", coffees("all"))}
              >
                Shop every coffee
              </ArrowLink>
            }
          >
            <MorphMenu.Column title="Coffee">
              <MorphMenu.Entry
                href="#coffees"
                onClick={jump("coffees", coffees("Light"))}
                title="Light roasts"
                caption="Bright and fruity"
              />
              <MorphMenu.Entry
                href="#coffees"
                onClick={jump("coffees", coffees("Medium"))}
                title="Medium roasts"
                caption="Caramel and chocolate"
              />
              <MorphMenu.Entry
                href="#coffees"
                onClick={jump("coffees", coffees("Dark"))}
                title="Dark roasts"
                caption="Made for milk"
              />
            </MorphMenu.Column>
            <MorphMenu.Column title="Subscribe">
              <MorphMenu.Entry
                href="#subscribe"
                onClick={jump("subscribe", plan("me"))}
                title="A subscription"
                caption="10% off, shipped free"
              />
              <MorphMenu.Entry
                href="#subscribe"
                onClick={jump("subscribe", plan("gift"))}
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
              {GUIDES.map((option) => (
                <MorphMenu.Entry
                  key={option.id}
                  href="#brewing"
                  onClick={jump("brewing", brew(option.id))}
                  title={option.name}
                  caption={`${String(option.coffee)} g to ${String(option.water)} g of water`}
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
            onClick={jump("subscribe", plan("me"))}
          >
            Subscribe
          </MorphMenu.Link>
        </NavBar>
        <SubNav items={SECTIONS} />
        <main id="main">
          <SplitHero
            id="this-week"
            eyebrow="Halfmoon Roastery, Portland"
            title="Coffee roasted the morning it ships."
            titleMore="Six farms, one roaster."
            body="Order by noon and we roast your bag the next morning, then send it out that afternoon. Shipping is free from $40."
            actions={
              <>
                <Button variant="primary" arrow="forward" asChild>
                  <a href="#coffees" onClick={jump("coffees", coffees("all"))}>
                    Shop the coffees
                  </a>
                </Button>
                <Button variant="soft" asChild>
                  <a href="#subscribe" onClick={jump("subscribe", plan("me"))}>
                    Start a subscription
                  </a>
                </Button>
              </>
            }
            visual={<ThisWeek />}
          />
          <Section size="sm">
            <Stack gap={6}>
              <Text
                variant="caption"
                tone="secondary"
                className="shop-cafes-caption"
              >
                Poured at cafés across Portland
              </Text>
              <LogoStrip label="Cafés that pour Halfmoon coffee">
                {CAFES.map((cafe) => (
                  <LogoStrip.Mark key={cafe}>
                    <Text variant="title" tone="tertiary">
                      {cafe}
                    </Text>
                  </LogoStrip.Mark>
                ))}
              </LogoStrip>
            </Stack>
          </Section>
          <Coffees
            roast={roast}
            origin={origin}
            onRoastChange={setRoast}
            onOriginChange={setOrigin}
            open={openCoffee}
            onOpenChange={setOpenCoffee}
          />
          <Subscribe planFor={planFor} onPlanForChange={setPlanFor} />
          <Story />
          <Brewing guide={guide} onGuideChange={setGuide} />
          <Questions open={questions} onOpenChange={setQuestions} />
          <Newsletter />
        </main>
        <Footer
          brand={
            <Stack gap={3}>
              <Inline gap={2}>
                <HalfmoonMark />
                <Text variant="title">Halfmoon Roastery</Text>
              </Inline>
              <Text variant="body-sm" tone="secondary">
                Small-batch coffee, roasted five mornings a week at 1180 SE
                Water Ave, Portland, Oregon.
              </Text>
            </Stack>
          }
          legal={
            <Text variant="caption" tone="secondary">
              © 2026 Halfmoon Roastery. A buttery demo.
            </Text>
          }
        >
          <Footer.Column title="Shop">
            <Footer.Link
              href="#coffees"
              onClick={jump("coffees", coffees("all"))}
            >
              Coffees
            </Footer.Link>
            <Footer.Link
              href="#subscribe"
              onClick={jump("subscribe", plan("me"))}
            >
              Subscriptions
            </Footer.Link>
            <Footer.Link
              href="#subscribe"
              onClick={jump("subscribe", plan("gift"))}
            >
              Gift a subscription
            </Footer.Link>
          </Footer.Column>
          <Footer.Column title="Learn">
            <Footer.Link href="#brewing" onClick={jump("brewing")}>
              Brew guides
            </Footer.Link>
            <Footer.Link href="#story" onClick={jump("story")}>
              How we roast
            </Footer.Link>
            <Footer.Link href="#letter" onClick={jump("letter")}>
              The letter
            </Footer.Link>
          </Footer.Column>
          <Footer.Column title="Help">
            <Footer.Link
              href="#questions"
              onClick={jump("questions", () => {
                setQuestions((open) =>
                  open.includes("shipping") ? open : [...open, "shipping"],
                );
              })}
            >
              Shipping
            </Footer.Link>
            <Footer.Link href="#questions" onClick={jump("questions")}>
              Questions
            </Footer.Link>
            <Footer.Link href="mailto:hello@halfmoon.example">
              Contact us
            </Footer.Link>
          </Footer.Column>
        </Footer>
        <div className="lane-room" aria-hidden="true" />
      </Page>
      <BagPanel
        open={bagOpen}
        onOpenChange={setBagOpen}
        email={account ?? ""}
        onShop={() => {
          setBagOpen(false);
          setRoast("all");
          setOrigin("all");
          scrollToSection("coffees");
        }}
        onChangePlan={() => {
          setBagOpen(false);
          scrollToSection("subscribe");
        }}
      />
      <SignInDialog open={signingIn} onOpenChange={setSigningIn} />
    </ShopContext>
  );
}
