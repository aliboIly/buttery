import type { ReactElement } from "react";
import { Stack, Surface, Text, demoChoice } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import {
  ArrowLink,
  Button,
  MorphMenu,
  NavBar,
  Page,
  Section,
} from "@butteryui/react";
import type { NavBarBehavior } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/navigation",
  title: "NavBar",
  description:
    "The bar across the top of a page: the brand, menus that open in one morphing panel, and the calls to action, static, sticky or auto-hiding.",
  order: 50,
  status: "stable",
  since: "0.7.0",
};

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
      Deckhand
    </a>
  );
}

function Story(): ReactElement {
  return (
    <Stack gap={2}>
      <Text variant="control" tone="secondary">
        New
      </Text>
      <Text variant="title">The presenter view</Text>
      <Text variant="body-sm" tone="secondary">
        Notes and the next slide, on your screen only.
      </Text>
    </Stack>
  );
}

function Bar({
  behavior,
  contained = true,
}: {
  readonly behavior: NavBarBehavior;
  readonly contained?: boolean;
}): ReactElement {
  return (
    <NavBar
      behavior={behavior}
      contained={contained}
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
            href="#slides"
            title="Slides"
            caption="Layouts and notes"
          />
          <MorphMenu.Entry
            href="#themes"
            title="Themes"
            caption="Fonts and colors"
          />
          <MorphMenu.Entry
            href="#sizes"
            title="Sizes"
            caption="Widescreen, square or your own"
          />
        </MorphMenu.Column>
        <MorphMenu.Column title="Share">
          <MorphMenu.Entry
            href="#export"
            title="Export"
            caption="PDF or PNG files"
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
            href="#first-deck"
            title="Your first deck"
            caption="Ten minutes from blank to done"
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
            caption="Slides for an announcement"
          />
          <MorphMenu.Entry
            href="#events"
            title="Events"
            caption="Talks, agendas and schedules"
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
  contained = true,
}: {
  readonly behavior: NavBarBehavior;
  readonly contained?: boolean;
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
        <Bar behavior={behavior} contained={contained} />
        <Stack gap={4} padX={8} padY={16}>
          <Text variant="display">Decks for every meeting</Text>
          <Text variant="body-lg">
            Written in an afternoon, ready for any screen.
          </Text>
        </Stack>
        {["Features", "Themes", "Export"].map((title) => (
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

function navBarCode({ behavior, contained }: DemoValues): string {
  return [
    "<NavBar",
    `  behavior="${String(behavior)}"`,
    ...(contained === true ? [] : ["  contained={false}"]),
    '  brand={<a href="/">Deckhand</a>}',
    "  actions={",
    "    <>",
    '      <Button variant="secondary">Sign in</Button>',
    '      <Button variant="primary" arrow="forward">',
    "        Get started",
    "      </Button>",
    "    </>",
    "  }",
    ">",
    '  <MorphMenu.Item label="Product" featured={<Story />} footer={<ArrowLink href="/features">See all features</ArrowLink>}>',
    '    <MorphMenu.Column title="Make">…</MorphMenu.Column>',
    "  </MorphMenu.Item>",
    '  <MorphMenu.Item label="Guides">…</MorphMenu.Item>',
    '  <MorphMenu.Link href="/pricing">Pricing</MorphMenu.Link>',
    "</NavBar>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    behavior: {
      kind: "choice",
      options: ["static", "sticky", "auto-hide"],
      initial: "sticky",
    },
    contained: { kind: "toggle", initial: true },
  },
  render: ({ behavior, contained }) => (
    <Site
      behavior={demoChoice(behavior, ["static", "sticky", "auto-hide"])}
      contained={contained === true}
    />
  ),
  code: navBarCode,
};

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
