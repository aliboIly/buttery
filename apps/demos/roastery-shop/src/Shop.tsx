import { useState } from "react";
import type { ReactElement } from "react";
import { Icon, Inline, Stack, Text, scrollToSection } from "@buttery/core";
import {
  Button,
  Footer,
  LogoStrip,
  Page,
  Section,
  SplitHero,
  SubNav,
  toast,
} from "@buttery/react";
import { SignInDialog, useAccount } from "./Account.tsx";
import { BAG_TOAST } from "./add-to-bag.ts";
import { BagPanel } from "./BagPanel.tsx";
import { bagCount, useBag } from "./bag.ts";
import { Brewing } from "./Brewing.tsx";
import { Coffees } from "./Coffees.tsx";
import type { OriginFilter, RoastFilter } from "./Coffees.tsx";
import { CAFES } from "./data.ts";
import type { CoffeeId, GuideId } from "./data.ts";
import { HalfmoonMark } from "./HalfmoonMark.tsx";
import { jump } from "./jump.ts";
import { Newsletter } from "./Newsletter.tsx";
import { Questions } from "./Questions.tsx";
import { ShopBar } from "./ShopBar.tsx";
import { ShopContext } from "./shop-context.ts";
import { Story } from "./Story.tsx";
import { Subscribe } from "./Subscribe.tsx";
import type { PlanFor } from "./Subscribe.tsx";
import { ThisWeek } from "./ThisWeek.tsx";

/** The roastery's street address, kept on one line. */
const ADDRESS = "1180\u00a0SE\u00a0Water\u00a0Ave";

const SECTIONS = [
  { id: "this-week", label: "This week" },
  { id: "coffees", label: "Coffees" },
  { id: "subscribe", label: "Subscribe" },
  { id: "story", label: "How we roast" },
  { id: "brewing", label: "Brew guides" },
  { id: "questions", label: "Questions" },
] as const;

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

  const showRoast = (filter: RoastFilter): void => {
    setRoast(filter);
    setOrigin("all");
  };
  const openBag = (): void => {
    toast.dismiss(BAG_TOAST);
    setOpenCoffee(null);
    setBagOpen(true);
  };
  const openQuestion = (id: string): void => {
    setQuestions((open) => (open.includes(id) ? open : [...open, id]));
  };
  const showCoffee = (coffee: CoffeeId): void => {
    showRoast("all");
    scrollToSection("coffees");
    setOpenCoffee(coffee);
  };

  return (
    <ShopContext value={{ openBag, showCoffee }}>
      <Page className="shop-page" data-testid="roastery-shop">
        <ShopBar
          count={bagCount(bag)}
          onOpenBag={openBag}
          onSignIn={() => {
            setSigningIn(true);
          }}
          onCoffees={showRoast}
          onPlan={setPlanFor}
          onGuide={setGuide}
          onQuestion={openQuestion}
        />
        <SubNav items={SECTIONS} />
        <main id="main">
          <SplitHero
            id="this-week"
            eyebrow="Halfmoon Roastery, Portland"
            title="Coffee roasted the morning it ships."
            titleMore="Six coffees, one roaster."
            body="Order by noon and we roast your bag the next morning, then send it out that afternoon. Shipping is free from $40."
            actions={
              <>
                <Button variant="primary" arrow="forward" asChild>
                  <a
                    href="#coffees"
                    onClick={jump("coffees", () => {
                      showRoast("all");
                    })}
                  >
                    Shop the coffees
                  </a>
                </Button>
                <Button variant="soft" asChild>
                  <a
                    href="#subscribe"
                    onClick={jump("subscribe", () => {
                      setPlanFor("me");
                    })}
                  >
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
                  <LogoStrip.Mark key={cafe.name}>
                    <Inline gap="1.5">
                      <Icon icon={cafe.icon} />
                      <Text variant="control" tone="tertiary">
                        {cafe.name}
                      </Text>
                    </Inline>
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
                {`Small-batch coffee, roasted to order at ${ADDRESS}, Portland, Oregon.`}
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
              onClick={jump("coffees", () => {
                showRoast("all");
              })}
            >
              Coffees
            </Footer.Link>
            <Footer.Link
              href="#subscribe"
              onClick={jump("subscribe", () => {
                setPlanFor("me");
              })}
            >
              Subscriptions
            </Footer.Link>
            <Footer.Link
              href="#subscribe"
              onClick={jump("subscribe", () => {
                setPlanFor("gift");
              })}
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
            <Footer.Link href="#story" onClick={jump("story")}>
              Our growers
            </Footer.Link>
          </Footer.Column>
          <Footer.Column title="Help">
            <Footer.Link
              href="#questions"
              onClick={jump("questions", () => {
                openQuestion("arrival");
              })}
            >
              Shipping
            </Footer.Link>
            <Footer.Link
              href="#questions"
              onClick={jump("questions", () => {
                openQuestion("returns");
              })}
            >
              Returns
            </Footer.Link>
            <Footer.Link href="#questions" onClick={jump("questions")}>
              Questions
            </Footer.Link>
          </Footer.Column>
          <Footer.Column title="Roastery">
            <Footer.Link href="#letter" onClick={jump("letter")}>
              The letter
            </Footer.Link>
            <Footer.Link href="mailto:wholesale@halfmoon.example">
              Wholesale
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
          showRoast("all");
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
