import type { MouseEvent, ReactElement } from "react";
import {
  Grid,
  Icon,
  Inline,
  Stack,
  Surface,
  Text,
  scrollToSection,
} from "@buttery/core";
import {
  Button,
  CenteredHero,
  Footer,
  MorphMenu,
  NavBar,
  Page,
  Section,
  Stat,
  StatStrip,
  toast,
} from "@buttery/react";
import { CalendarRange, CloudOff, MousePointerClick } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Router, useLink } from "./router.tsx";
import type { RouterProps } from "./router.tsx";
import "./app.css";

const NAME = "buttery site";

/** The paths the site has a page for, which a static build writes out. */
export const routes: readonly string[] = ["/"];

const FEATURES: readonly {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly body: string;
}[] = [
  {
    icon: CalendarRange,
    title: "The whole week on one page",
    body: "Every task and meeting from Monday to Sunday, with who's busy and who's free.",
  },
  {
    icon: MousePointerClick,
    title: "Drag to plan again",
    body: "Move a task to another day and everything after it makes room.",
  },
  {
    icon: CloudOff,
    title: "Works without a connection",
    body: "Plan on a train or a plane; your changes sync when you're back online.",
  },
];

const PLANS: readonly {
  readonly name: string;
  readonly price: string;
  readonly lines: readonly string[];
  readonly primary: boolean;
}[] = [
  {
    name: "Solo",
    price: "Free",
    lines: ["One planner", "A year of history", "Every feature above"],
    primary: false,
  },
  {
    name: "Team",
    price: "$4 a person a month",
    lines: [
      "Shared weeks for the team",
      "History that never expires",
      "Help within a day",
    ],
    primary: true,
  },
];

/** A link to a section of this page that scrolls there below the sticky bar, leaving the address alone. */
function jumpTo(id: string): (event: MouseEvent<HTMLAnchorElement>) => void {
  return (event) => {
    if (scrollToSection(id)) event.preventDefault();
  };
}

function Site(): ReactElement {
  const link = useLink();
  return (
    <Page>
      <NavBar
        behavior="sticky"
        brand={<a href={link("/")}>{NAME}</a>}
        actions={
          <Button variant="primary" arrow="forward" asChild>
            <a href="#pricing" onClick={jumpTo("pricing")}>
              Get started
            </a>
          </Button>
        }
      >
        <MorphMenu.Link href="#features" onClick={jumpTo("features")}>
          Features
        </MorphMenu.Link>
        <MorphMenu.Link href="#pricing" onClick={jumpTo("pricing")}>
          Pricing
        </MorphMenu.Link>
      </NavBar>
      <CenteredHero
        title="Plan the week in ten minutes."
        body="Lay out the week's work, see who's free, and move a task with one drag."
        actions={
          <>
            <Button variant="primary" size="cta" arrow="forward" asChild>
              <a href="#pricing" onClick={jumpTo("pricing")}>
                Start planning
              </a>
            </Button>
            <Button variant="secondary" size="cta" asChild>
              <a href="#features" onClick={jumpTo("features")}>
                See how it works
              </a>
            </Button>
          </>
        }
      />
      <Section
        id="features"
        tone="muted"
        title="Everything a week needs"
        body="Three things it does well, and nothing to set up first."
      >
        <Grid columns={{ base: 1, md: 3 }} gap={4}>
          {FEATURES.map((feature) => (
            <Surface key={feature.title} level="card" pad={6}>
              <Stack gap={3}>
                <Icon icon={feature.icon} />
                <Text variant="title" asChild>
                  <h3>{feature.title}</h3>
                </Text>
                <Text variant="body" tone="secondary">
                  {feature.body}
                </Text>
              </Stack>
            </Surface>
          ))}
        </Grid>
      </Section>
      <Section size="sm">
        <StatStrip>
          <Stat value={10} label="minutes to plan a week" />
          <Stat value={3} label="views: day, week and team" />
          <Stat value={7} label="days on one page" />
        </StatStrip>
      </Section>
      <Section
        id="pricing"
        title="Free for one, simple for a team"
        body="Start on your own and bring the team when you're ready."
      >
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          {PLANS.map((plan) => (
            <Surface key={plan.name} level="card" pad={6}>
              <Stack gap={4}>
                <Stack gap={2}>
                  <Text variant="title" asChild>
                    <h3>{plan.name}</h3>
                  </Text>
                  <Text variant="heading-2">{plan.price}</Text>
                </Stack>
                <Stack gap={2}>
                  {plan.lines.map((line) => (
                    <Text key={line} variant="body" tone="secondary">
                      {line}
                    </Text>
                  ))}
                </Stack>
                <Inline>
                  <Button
                    variant={plan.primary ? "primary" : "soft"}
                    onClick={() => {
                      toast(
                        `${plan.name} goes to the sign-up page once there is one.`,
                      );
                    }}
                  >
                    {plan.primary ? "Try it with your team" : "Start for free"}
                  </Button>
                </Inline>
              </Stack>
            </Surface>
          ))}
        </Grid>
      </Section>
      <CenteredHero
        titleAs="h2"
        title="Your next week, planned."
        titleMore="It takes ten minutes."
        actions={
          <Button variant="primary" arrow="forward" asChild>
            <a href="#pricing" onClick={jumpTo("pricing")}>
              Start planning
            </a>
          </Button>
        }
      />
      <Footer
        brand={
          <Stack gap={2}>
            <Text variant="title">{NAME}</Text>
            <Text variant="body-sm" tone="secondary">
              A planner for the week ahead.
            </Text>
          </Stack>
        }
        legal={
          <Text variant="caption" tone="secondary">
            © 2026 {NAME}
          </Text>
        }
      >
        <Footer.Column title="Product">
          <Footer.Link href="#features" onClick={jumpTo("features")}>
            Features
          </Footer.Link>
          <Footer.Link href="#pricing" onClick={jumpTo("pricing")}>
            Pricing
          </Footer.Link>
        </Footer.Column>
      </Footer>
      <div className="lane-room" aria-hidden="true" />
    </Page>
  );
}

/** The site: a sticky bar, a hero, sections for what it does and what it costs, and a footer. */
export function App(props: RouterProps): ReactElement {
  return (
    <Router {...props}>
      <Site />
    </Router>
  );
}
