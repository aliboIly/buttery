import type { ReactElement } from "react";
import { Stack, Surface, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  ArrowLink,
  Button,
  MorphMenu,
  NavBar,
  Page,
  Section,
} from "@buttery/react";
import type { NavBarBehavior } from "@buttery/react";

function fill(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

function Brand(): ReactElement {
  return (
    <a href="#top">
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="4" fill="currentColor" />
        <rect
          x="7"
          y="9"
          width="7"
          height="2"
          rx="1"
          style={{ fill: "var(--bt-bg-surface)" }}
        />
      </svg>
      Card Studio
    </a>
  );
}

function Story(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="control" tone="secondary">
        New
      </Text>
      <Text variant="title">The lean pad</Text>
      <Text variant="body-sm" tone="secondary">
        Turn the card toward you, up to 20 degrees.
      </Text>
    </Stack>
  );
}

function Bar({
  behavior,
}: {
  readonly behavior: NavBarBehavior;
}): ReactElement {
  return (
    <NavBar
      behavior={behavior}
      brand={<Brand />}
      actions={
        <>
          <Button variant="secondary">Sign in</Button>
          <Button variant="primary" arrow="forward">
            Get started
          </Button>
        </>
      }
    >
      <MorphMenu.Item
        label="Product"
        featured={<Story />}
        footer={<ArrowLink href="#features">See all features</ArrowLink>}
      >
        <MorphMenu.Column title="Make">
          <MorphMenu.Entry
            href="#cards"
            title="Cards"
            caption="Titles, finishes and leans"
          />
          <MorphMenu.Entry
            href="#backdrops"
            title="Backdrops"
            caption="Blends, colors or your own picture"
          />
          <MorphMenu.Entry
            href="#sizes"
            title="Sizes"
            caption="Square to story, or your own"
          />
        </MorphMenu.Column>
        <MorphMenu.Column title="Share">
          <MorphMenu.Entry
            href="#export"
            title="Export"
            caption="PNG or JPG at the canvas's size"
          />
          <MorphMenu.Entry
            href="#copy"
            title="Copy"
            caption="On the clipboard, ready to paste"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item label="Guides">
        <MorphMenu.Column title="Learn">
          <MorphMenu.Entry
            href="#first-card"
            title="Your first card"
            caption="Five minutes from blank to done"
          />
          <MorphMenu.Entry
            href="#shortcuts"
            title="Shortcuts"
            caption="Every key on one page"
          />
        </MorphMenu.Column>
        <MorphMenu.Column title="Ideas">
          <MorphMenu.Entry
            href="#launch"
            title="Launch day"
            caption="Cards for an announcement"
          />
          <MorphMenu.Entry
            href="#events"
            title="Events"
            caption="Speaker cards and schedules"
          />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Item label="Company">
        <MorphMenu.Column>
          <MorphMenu.Entry href="#about" title="About" />
          <MorphMenu.Entry href="#careers" title="Careers" />
          <MorphMenu.Entry href="#press" title="Press kit" />
        </MorphMenu.Column>
      </MorphMenu.Item>
      <MorphMenu.Link href="#pricing">Pricing</MorphMenu.Link>
    </NavBar>
  );
}

function Site({
  behavior,
}: {
  readonly behavior: NavBarBehavior;
}): ReactElement {
  const hero = fill("sky") ?? "none";
  return (
    <Surface
      level="card"
      role="region"
      aria-label={`${behavior} nav bar demo`}
      tabIndex={0}
      style={{
        blockSize: "calc(var(--bt-bento-row) * 1.75)",
        overflowY: "auto",
      }}
    >
      <Page
        style={{
          background: `${hero} top / 100% calc(var(--bt-bento-row) * 1.25) no-repeat, var(--bt-bg-surface)`,
        }}
      >
        <Bar behavior={behavior} />
        <Stack gap={4} padX={8} padY={16}>
          <Text variant="display">Cards for launch days</Text>
          <Text variant="body-lg">Made in a minute, ready for every post.</Text>
        </Stack>
        {["Features", "Backdrops", "Export"].map((title) => (
          <Section
            key={title}
            size="sm"
            title={title}
            body="Room to scroll, so the bar can show what it does."
          />
        ))}
      </Page>
    </Surface>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Sticky",
    description:
      "64px on the page container, with no background over the hero. Its menus open in one MorphMenu card just under the bar while the page blurs. Scrolled, it stays pinned on the panel surface. Narrow the page and everything folds into the menu button.",
    render: () => <Site behavior="sticky" />,
  },
  {
    title: "Auto-hide",
    description:
      "Slides away on spring.smooth as the page scrolls down and comes back as it scrolls up, publishing how far it has gone as --bt-sticky-shift for a SubNav under it.",
    render: () => <Site behavior="auto-hide" />,
  },
];
