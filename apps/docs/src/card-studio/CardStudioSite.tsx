import type { MouseEvent, ReactElement, ReactNode } from "react";
import {
  Center,
  Grid,
  Inline,
  Stack,
  Stagger,
  Surface,
  Text,
  scrollToSection,
} from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  ArrowLink,
  Bento,
  Button,
  CenteredHero,
  ExpandableCard,
  Footer,
  LogoStrip,
  MorphMenu,
  NavBar,
  Page,
  Section,
  SplitHero,
  Stat,
  StatStrip,
  SubNav,
} from "@buttery/react";
import { CardStudioMark } from "./CardStudioMark.tsx";

const STUDIO = "/demos/card-studio";

const SECTIONS = [
  { id: "site-overview", label: "Overview" },
  { id: "site-features", label: "Features" },
  { id: "site-backdrops", label: "Backdrops" },
  { id: "site-numbers", label: "In numbers" },
  { id: "site-pricing", label: "Pricing" },
] as const;

const BACKDROPS = ["cream", "peach", "lilac", "sky", "mint", "violet"] as const;

const TEAMS = [
  "Tidewater",
  "Bramble",
  "Quillwork",
  "Halcyon",
  "Ferro",
  "Pennant",
] as const;

function fill(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

/** A link that jumps to a section of this page without touching the playground's route. */
function jumpTo(id: string): (event: MouseEvent<HTMLAnchorElement>) => void {
  return (event) => {
    if (scrollToSection(id)) event.preventDefault();
  };
}

function Brand(): ReactElement {
  return (
    <a href={STUDIO}>
      <CardStudioMark />
      Card Studio
    </a>
  );
}

function Chip({
  label,
  tilt = 0,
}: {
  readonly label: string;
  readonly tilt?: number;
}): ReactElement {
  return (
    <Surface
      level="card"
      padX={6}
      padY={4}
      style={tilt === 0 ? undefined : { rotate: `${String(tilt)}deg` }}
    >
      <Text variant="title">{label}</Text>
    </Surface>
  );
}

/** A picture rising from the bottom of a bento card, inset from its sides. */
function Picture({
  backdrop,
  children,
}: {
  readonly backdrop: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div style={{ blockSize: "100%", paddingInline: "var(--bt-space-6)" }}>
      <Center
        style={{
          blockSize: "100%",
          background: fill(backdrop),
          borderStartStartRadius: "var(--bt-r-lg)",
          borderStartEndRadius: "var(--bt-r-lg)",
        }}
      >
        {children}
      </Center>
    </div>
  );
}

function HeroVisual(): ReactElement {
  return (
    <>
      <Stagger.Item>
        <Surface level="card" style={{ background: fill("lilac") }}>
          <Center style={{ padding: "var(--bt-space-10)" }}>
            <Chip label="Launch card" tilt={-6} />
          </Center>
        </Surface>
      </Stagger.Item>
      <Stagger.Item>
        <Inline gap={3}>
          <Surface level="section" padX={4} padY={3}>
            <Text variant="label">Finish · Ink</Text>
          </Surface>
          <Surface level="section" padX={4} padY={3}>
            <Text variant="label">Backdrop · Lilac</Text>
          </Surface>
        </Inline>
      </Stagger.Item>
    </>
  );
}

function Menus(): ReactElement[] {
  return [
    <MorphMenu.Item
      key="product"
      label="Product"
      footer={
        <ArrowLink href={STUDIO} arrow="forward">
          Open the studio
        </ArrowLink>
      }
    >
      <MorphMenu.Column title="Make">
        <MorphMenu.Entry
          href="#site-features"
          onClick={jumpTo("site-features")}
          title="Cards"
          caption="Titles, finishes and leans"
        />
        <MorphMenu.Entry
          href="#site-backdrops"
          onClick={jumpTo("site-backdrops")}
          title="Backdrops"
          caption="Blends, colors or your own picture"
        />
      </MorphMenu.Column>
      <MorphMenu.Column title="Share">
        <MorphMenu.Entry
          href={STUDIO}
          title="Export"
          caption="PNG or JPG at the canvas's size"
        />
        <MorphMenu.Entry
          href={STUDIO}
          title="Copy"
          caption="On the clipboard, ready to paste"
        />
      </MorphMenu.Column>
    </MorphMenu.Item>,
    <MorphMenu.Item key="guides" label="Guides">
      <MorphMenu.Column title="Learn">
        <MorphMenu.Entry
          href="/components/onboarding"
          title="The tour"
          caption="Four steps, one minute"
        />
        <MorphMenu.Entry
          href="/components/kbd"
          title="Shortcuts"
          caption="Every key on one page"
        />
      </MorphMenu.Column>
    </MorphMenu.Item>,
    <MorphMenu.Link
      key="pricing"
      href="#site-pricing"
      onClick={jumpTo("site-pricing")}
    >
      Pricing
    </MorphMenu.Link>,
  ];
}

function Plan({
  name,
  price,
  lines,
  action,
}: {
  readonly name: string;
  readonly price: string;
  readonly lines: readonly string[];
  readonly action: ReactNode;
}): ReactElement {
  return (
    <Surface level="card" pad={6}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Text variant="title">{name}</Text>
          <Text variant="heading-2">{price}</Text>
        </Stack>
        <Stack gap={2}>
          {lines.map((line) => (
            <Text key={line} variant="body" tone="secondary">
              {line}
            </Text>
          ))}
        </Stack>
        <Inline>{action}</Inline>
      </Stack>
    </Surface>
  );
}

/** Card Studio's own launch page, made only from buttery's page patterns. */
export function CardStudioSite(): ReactElement {
  return (
    <Page>
      <NavBar
        behavior="auto-hide"
        brand={<Brand />}
        actions={
          <>
            <Button variant="secondary" asChild>
              <a href={STUDIO}>Sign in</a>
            </Button>
            <Button variant="primary" arrow="forward" asChild>
              <a href={STUDIO}>Get started</a>
            </Button>
          </>
        }
      >
        {Menus()}
      </NavBar>
      <SubNav
        title="Card Studio"
        items={SECTIONS}
        action={
          <Button size="sm" variant="primary" asChild>
            <a href={STUDIO}>Open</a>
          </Button>
        }
      />
      <SplitHero
        id="site-overview"
        eyebrow="Card Studio"
        title="Cards for launch days."
        titleMore="Write a title, pick a finish, and send it out at any size."
        actions={
          <>
            <Button variant="primary" arrow="forward" asChild>
              <a href={STUDIO}>Open the studio</a>
            </Button>
            <Button variant="soft" asChild>
              <a href="/components/onboarding">Take the tour</a>
            </Button>
          </>
        }
        visual={<HeroVisual />}
      />
      <Section size="sm">
        <LogoStrip label="Teams that make their cards here">
          {TEAMS.map((team) => (
            <LogoStrip.Mark key={team}>
              <Text variant="title" tone="tertiary">
                {team}
              </Text>
            </LogoStrip.Mark>
          ))}
        </LogoStrip>
      </Section>
      <Section
        id="site-features"
        tone="muted"
        title="Everything a card needs"
        body="Open a card to see how it works."
      >
        <Bento>
          <ExpandableCard
            title="Lean it in 3D"
            span={8}
            detail={
              <Text variant="body-lg">
                Steer the lean pad and the card tips toward you, up to 20
                degrees each way. The export draws the same turn.
              </Text>
            }
          >
            <Picture backdrop="lilac">
              <Chip label="Launch card" tilt={-6} />
            </Picture>
          </ExpandableCard>
          <ExpandableCard
            title="Any size"
            span={4}
            detail={
              <Text variant="body-lg">
                Square, classic, photo, wide or tall, or a size of your own.
              </Text>
            }
          >
            <Picture backdrop="cream">
              <Chip label="16:9" />
            </Picture>
          </ExpandableCard>
          <ExpandableCard
            title="Three finishes"
            span={4}
            detail={
              <Text variant="body-lg">
                Clear lets the backdrop through, Paper is a soft white and Ink a
                deep near-black.
              </Text>
            }
          >
            <Picture backdrop="sky">
              <Chip label="Ink" />
            </Picture>
          </ExpandableCard>
          <ExpandableCard
            title="Every change kept"
            span={8}
            detail={
              <Text variant="body-lg">
                Undo and Redo remember every change, so trying an idea costs
                nothing.
              </Text>
            }
          >
            <Picture backdrop="mint">
              <Chip label="Undo · Redo" />
            </Picture>
          </ExpandableCard>
        </Bento>
      </Section>
      <Section
        id="site-backdrops"
        title="A backdrop for every mood"
        body="Blends, solid colors, or a picture of your own behind the card."
      >
        <Grid columns={{ base: 2, md: 3, lg: 6 }} gap={4}>
          {BACKDROPS.map((id) => {
            const preset = gradients.find((candidate) => candidate.id === id);
            return (
              <Stack key={id} gap={2}>
                <Surface
                  level="card"
                  padY={12}
                  style={{ background: fill(id) }}
                  aria-hidden="true"
                />
                <Text variant="label">{preset?.name ?? id}</Text>
              </Stack>
            );
          })}
        </Grid>
      </Section>
      <Section id="site-numbers" size="sm" tone="muted">
        <StatStrip>
          <Stat value={3} label="finishes" />
          <Stat value={24} label="blends" />
          <Stat value={6} label="canvas shapes" />
          <Stat value={100} label="steps of undo" />
        </StatStrip>
      </Section>
      <Section
        id="site-pricing"
        title="One price for the rest"
        body="Free while you make a card a day."
      >
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          <Plan
            name="Free"
            price="$0"
            lines={[
              "A card a day",
              "Every finish and blend",
              "PNG at the canvas's size",
            ]}
            action={
              <Button variant="soft" asChild>
                <a href={STUDIO}>Start free</a>
              </Button>
            }
          />
          <Plan
            name="Studio"
            price="$6 a month"
            lines={[
              "As many cards as you like",
              "Your own pictures behind them",
              "PNG and JPG, and Copy",
            ]}
            action={
              <Button variant="primary" arrow="forward" asChild>
                <a href={STUDIO}>Try Studio</a>
              </Button>
            }
          />
        </Grid>
      </Section>
      <CenteredHero
        titleAs="h2"
        title="Make your first card."
        titleMore="It takes a minute."
        actions={
          <Button variant="primary" arrow="forward" asChild>
            <a href={STUDIO}>Open the studio</a>
          </Button>
        }
      />
      <Footer
        brand={
          <Stack gap={2}>
            <Text variant="title">Card Studio</Text>
            <Text variant="body-sm" tone="secondary">
              Cards for launch days, made in a minute.
            </Text>
          </Stack>
        }
        legal={
          <Text variant="caption" tone="secondary">
            © 2026 Card Studio. A buttery demo.
          </Text>
        }
      >
        <Footer.Column title="Product">
          <Footer.Link href="#site-features" onClick={jumpTo("site-features")}>
            Features
          </Footer.Link>
          <Footer.Link href="#site-pricing" onClick={jumpTo("site-pricing")}>
            Pricing
          </Footer.Link>
        </Footer.Column>
        <Footer.Column title="Studio">
          <Footer.Link href={STUDIO}>Open the studio</Footer.Link>
          <Footer.Link href="/components/onboarding">The tour</Footer.Link>
        </Footer.Column>
      </Footer>
    </Page>
  );
}
