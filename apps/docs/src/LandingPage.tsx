import { useState } from "react";
import type { ReactElement } from "react";
import { Bell, Bot, Package, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Grid,
  Icon,
  Inline,
  Menu,
  Reveal,
  Stack,
  Stagger,
  Surface,
  Text,
} from "@buttery/core";
import {
  ArrowLink,
  Button,
  CenteredHero,
  Footer,
  Page,
  Section,
  SegmentedControl,
  Slider,
  toast,
} from "@buttery/react";
import { releases } from "virtual:buttery-whats-new";
import { CopyLine } from "./CopyLine.tsx";
import { withInlineCode } from "./inline-code.tsx";
import { siteHref } from "./location.ts";
import { COMPONENTS_OVERVIEW } from "./nav.ts";
import { DOCS_VERSION, SOURCE_URL } from "./routes.ts";
import { ReleaseCard } from "./WhatsNew.tsx";
import { Logo } from "./Logo.tsx";

/** A section of the site with how many pages it holds, for the Explore tiles. */
export interface ExploreSection {
  readonly title: string;
  /** Its first page. */
  readonly href: string;
  readonly count: number;
  /** What it counts, such as `"pages"` or `"components"`. */
  readonly unit: string;
}

/** The command that starts a new app today; `create-buttery` takes its place once it's published. */
const NEW_APP = "pnpm new-app my-app";

const STARTS: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly text: string;
  readonly href: string;
  readonly link: string;
}[] = [
  {
    icon: Package,
    title: "A new app",
    text: `\`${NEW_APP}\` copies the starter with the provider, the styles and the layout checks already in place, for the web and the desktop.`,
    href: siteHref("/get-started/installation"),
    link: "Installation",
  },
  {
    icon: Wrench,
    title: "An existing app",
    text: "Add the provider and the styles, then move one screen at a time onto buttery's components, from the top down, with the layout check watching.",
    href: siteHref("/guides/make-an-existing-app-buttery"),
    link: "Make an existing app buttery",
  },
  {
    icon: Bot,
    title: "With a coding agent",
    text: "`AGENTS.md` and the make-it-buttery skill give an agent the rules, and every check says how to fix what it finds.",
    href: siteHref("/get-started/using-coding-agents"),
    link: "Using coding agents",
  },
];

const NOTIFY = ["Everything", "Mentions", "Nothing"] as const;

/** A settings card made of real components, for a visitor to try: a segmented control, a slider, a menu and a toast. */
function TryIt(): ReactElement {
  const [notify, setNotify] = useState<(typeof NOTIFY)[number]>("Mentions");
  const [lead, setLead] = useState(15);
  const [snoozed, setSnoozed] = useState(false);
  const preview = snoozed
    ? "Snoozed for an hour"
    : notify === "Nothing"
      ? "Reminders are off"
      : lead === 0
        ? "Starting now"
        : `Starts in ${String(lead)} minutes`;
  return (
    <Surface level="card" pad={6}>
      <Grid columns={{ base: 1, lg: 2 }} gap={8}>
        <Stack gap={6}>
          <Text variant="title" asChild>
            <h3>Reminders</h3>
          </Text>
          <Stack gap={2}>
            <Text variant="label">Notify me about</Text>
            <SegmentedControl
              label="Notify me about"
              options={NOTIFY}
              value={notify}
              onValueChange={setNotify}
            />
          </Stack>
          <Slider
            label="Remind"
            min={0}
            max={60}
            step={5}
            detents={[15, 30]}
            resetValue={15}
            format={(value) => `${String(value)} min`}
            value={lead}
            onValueChange={setLead}
          />
          <Inline gap={2} justify="end">
            <Menu>
              <Menu.Trigger asChild>
                <Button variant="secondary">More</Button>
              </Menu.Trigger>
              <Menu.Content>
                <Menu.Item
                  onSelect={() => {
                    setSnoozed(true);
                  }}
                >
                  Snooze for an hour
                </Menu.Item>
                <Menu.Item
                  onSelect={() => {
                    setSnoozed(false);
                  }}
                >
                  Turn reminders back on
                </Menu.Item>
              </Menu.Content>
            </Menu>
            <Button
              variant="primary"
              onClick={() => {
                toast.success("Reminder settings saved");
              }}
            >
              Save
            </Button>
          </Inline>
        </Stack>
        <Surface level="section" pad={5}>
          <Stack gap={3}>
            <Text variant="caption" tone="secondary">
              Preview
            </Text>
            <Inline gap={3} align="center">
              <Icon icon={Bell} />
              <Stack gap={1}>
                <Text variant="title-sm">Design review</Text>
                <Text variant="body-sm" tone="secondary">
                  {preview}
                </Text>
              </Stack>
            </Inline>
          </Stack>
        </Surface>
      </Grid>
    </Surface>
  );
}

/**
 * The site's front page: what buttery is and how to start, where to begin, the latest releases, a settings
 * card to try, and every section with how much is in it.
 */
export function LandingPage({
  sections,
}: {
  readonly sections: readonly ExploreSection[];
}): ReactElement {
  return (
    <Page>
      <CenteredHero
        eyebrow={<Logo size="lg" />}
        title="Make anything buttery."
        body="A React design system with the layout and motion to match, for web and desktop apps, and checks that hold every screen to it."
        actions={
          <>
            <Button variant="primary" size="cta" arrow="forward" asChild>
              <a href={siteHref("/get-started/introduction")}>Get started</a>
            </Button>
            <Button variant="secondary" size="cta" asChild>
              <a href={siteHref(`/${COMPONENTS_OVERVIEW}`)}>
                Browse components
              </a>
            </Button>
            <Stack gap={1} align="center" className="docs-landing-command">
              <CopyLine text={NEW_APP} label="Copy the command" />
              <Text variant="caption" tone="secondary">
                Run it in a clone of the buttery repository until buttery is on
                npm.{" "}
                <a
                  href={siteHref("/get-started/installation")}
                  className="docs-link bt-focus"
                >
                  Installation
                </a>{" "}
                has the steps.
              </Text>
            </Stack>
          </>
        }
      />
      <Reveal>
        <Section size="sm" title="Where to start">
          <Grid columns={{ base: 1, lg: 3 }} gap={4}>
            {STARTS.map((start) => (
              <Surface key={start.title} level="card" pad={6}>
                <Stack gap={3} align="start">
                  <Icon icon={start.icon} />
                  <Text variant="title" asChild>
                    <h3>{start.title}</h3>
                  </Text>
                  <Text variant="body" tone="secondary">
                    {withInlineCode(start.text)}
                  </Text>
                  <ArrowLink href={start.href}>{start.link}</ArrowLink>
                </Stack>
              </Surface>
            ))}
          </Grid>
        </Section>
      </Reveal>
      <Reveal>
        <Section size="sm" title="What's new">
          <Stack gap={4}>
            <Grid columns={{ base: 1, lg: 3 }} gap={4}>
              {releases.slice(0, 3).map((release) => (
                <ReleaseCard
                  key={release.version}
                  release={release}
                  heading="h3"
                />
              ))}
            </Grid>
            <Inline>
              <ArrowLink href={siteHref("/resources/whats-new")}>
                Every release and change
              </ArrowLink>
            </Inline>
          </Stack>
        </Section>
      </Reveal>
      <Reveal>
        <Section
          size="sm"
          title="Try it"
          body="Real components, not pictures of them. Press, drag and open them."
        >
          <TryIt />
        </Section>
      </Reveal>
      <Section size="sm" title="Explore">
        <Stagger asChild>
          <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
            {sections.map((section) => (
              <Surface key={section.title} level="card" pad={5}>
                <Stack gap={2} align="start">
                  <Text variant="title" asChild>
                    <h3>{section.title}</h3>
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {`${String(section.count)} ${section.unit}`}
                  </Text>
                  <ArrowLink href={section.href}>
                    {`Open ${section.title}`}
                  </ArrowLink>
                </Stack>
              </Surface>
            ))}
          </Grid>
        </Stagger>
      </Section>
      <Footer
        brand={
          <Inline gap={2} align="center">
            <Logo />
            <Text variant="title">buttery</Text>
          </Inline>
        }
        legal={
          <Text variant="caption" tone="secondary">
            {`Version ${DOCS_VERSION}`}
          </Text>
        }
      >
        <Footer.Column title="Project">
          <Footer.Link href={SOURCE_URL}>GitHub</Footer.Link>
          <Footer.Link href={siteHref("/resources/roadmap")}>
            Roadmap
          </Footer.Link>
          <Footer.Link href={siteHref("/resources/whats-new")}>
            What's new
          </Footer.Link>
        </Footer.Column>
        <Footer.Column title="Docs">
          <Footer.Link href={siteHref("/get-started/introduction")}>
            Get started
          </Footer.Link>
          <Footer.Link href={siteHref(`/${COMPONENTS_OVERVIEW}`)}>
            Components
          </Footer.Link>
          <Footer.Link href={siteHref("/patterns/overview")}>
            Patterns
          </Footer.Link>
        </Footer.Column>
      </Footer>
    </Page>
  );
}
