import { useState } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  Grid,
  Inline,
  Morph,
  OverflowCluster,
  Pressable,
  Stack,
  Surface,
  Text,
} from "@butteryui/core";
import {
  Avatar,
  Button,
  SegmentedControl,
  Slider,
  StatusBadge,
  Switch,
} from "@butteryui/react";
import "./intro.css";

/** What a feature's card shows above its words. */
export type FeatureVisual =
  "tokens" | "layout" | "motion" | "components" | "checks" | "agents";

const COLORS = ["accent", "success", "warning", "danger"] as const;

function TokensVisual(): ReactElement {
  return (
    <Stack gap={3} align="center" aria-hidden="true">
      <Text variant="heading-1">Aa</Text>
      <Inline gap={2}>
        {COLORS.map((color) => (
          <span
            key={color}
            className="docs-feature-dot"
            style={{ backgroundColor: `var(--bt-${color})` }}
          />
        ))}
      </Inline>
    </Stack>
  );
}

const STYLES = [
  "Bold",
  "Italic",
  "Underline",
  "Strikethrough",
  "Code",
] as const;

type Style = (typeof STYLES)[number];

/** A toolbar in a box as wide as its slider says, folding its last buttons into More instead of wrapping. */
function LayoutVisual(): ReactElement {
  const [width, setWidth] = useState(100);
  const [on, setOn] = useState<ReadonlySet<Style>>(() => new Set(["Bold"]));
  const toggle = (style: Style): void => {
    setOn((current) => {
      const next = new Set(current);
      if (next.has(style)) next.delete(style);
      else next.add(style);
      return next;
    });
  };
  return (
    <Stack gap={4} className="docs-feature-fill">
      <div
        className="docs-feature-box"
        style={{ inlineSize: `${String(width)}%` }}
      >
        <OverflowCluster gap={1} moreLabel="More styles">
          {STYLES.map((style, index) => (
            <OverflowCluster.Item
              key={style}
              priority={STYLES.length - index}
              menuItem={{
                label: on.has(style) ? `Turn off ${style}` : style,
                onSelect: () => {
                  toggle(style);
                },
              }}
            >
              <Pressable
                aria-pressed={on.has(style)}
                className="docs-feature-tool"
                onClick={() => {
                  toggle(style);
                }}
              >
                <Text variant="button">{style}</Text>
              </Pressable>
            </OverflowCluster.Item>
          ))}
        </OverflowCluster>
      </div>
      <Slider
        label="Toolbar width"
        labelPosition="top"
        min={40}
        max={100}
        step={5}
        format="%"
        resetValue={100}
        value={width}
        onValueChange={setWidth}
      />
    </Stack>
  );
}

const RANGES = ["Day", "Week", "Month"] as const;

const ORDERS: Readonly<Record<(typeof RANGES)[number], string>> = {
  Day: "18 orders today",
  Week: "112 orders this week",
  Month: "486 orders this month",
};

/** An indicator that slides to the picked range and a total that crossfades to match it. */
function MotionVisual(): ReactElement {
  const [range, setRange] = useState<(typeof RANGES)[number]>("Week");
  return (
    <Stack gap={4} align="center">
      <SegmentedControl
        label="Range"
        options={RANGES}
        value={range}
        onValueChange={setRange}
      />
      <Morph contentKey={range}>
        <Text variant="title" tabular>
          {ORDERS[range]}
        </Text>
      </Morph>
    </Stack>
  );
}

const PEOPLE = ["Mara Ellis", "Theo Park", "Ana Ruiz"] as const;

function ComponentsVisual(): ReactElement {
  const [summary, setSummary] = useState(true);
  return (
    <Stack gap={3} className="docs-feature-fill">
      <Inline gap={3} align="center" justify="between">
        <Inline gap={1}>
          {PEOPLE.map((name) => (
            <Avatar key={name} name={name} size="sm" />
          ))}
        </Inline>
        <StatusBadge tone="success">Paid</StatusBadge>
      </Inline>
      <Switch
        label="Weekly summary"
        checked={summary}
        onCheckedChange={setSummary}
      />
      <Inline justify="end">
        <Button variant="secondary">Invite</Button>
      </Inline>
    </Stack>
  );
}

function ChecksVisual(): ReactElement {
  return (
    <Stack gap={2} aria-hidden="true" className="docs-feature-mono">
      <span>await expectButtery(page);</span>
      <span className="docs-feature-pass">✓ 390 and 1280, light and dark</span>
      <span className="docs-feature-pass">
        ✓ No overlap, overflow or crowding
      </span>
    </Stack>
  );
}

function AgentsVisual(): ReactElement {
  return (
    <Stack gap={2} aria-hidden="true" className="docs-feature-mono">
      <span className="docs-feature-muted">
        GET /get-started/introduction.md
      </span>
      <span># Introduction</span>
      <span>buttery is a React design system…</span>
    </Stack>
  );
}

function visualOf(visual: FeatureVisual): ReactElement {
  switch (visual) {
    case "tokens":
      return <TokensVisual />;
    case "layout":
      return <LayoutVisual />;
    case "motion":
      return <MotionVisual />;
    case "components":
      return <ComponentsVisual />;
    case "checks":
      return <ChecksVisual />;
    case "agents":
      return <AgentsVisual />;
    default: {
      const unknown: never = visual;
      throw new Error(`No visual named ${String(unknown)}.`);
    }
  }
}

/** The features of buttery as cards, two to a row where there's room. */
export function FeatureGrid({
  children,
}: {
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Grid columns={{ base: 1, md: 2 }} gap={4} className="docs-features">
      {children}
    </Grid>
  );
}

/**
 * One feature in a card: a small live part of buttery doing it, then its heading, words and link, written
 * in the page's Markdown so the page's `.md` and its search have them too.
 */
export function Feature({
  visual,
  children,
}: {
  readonly visual: FeatureVisual;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <Surface level="card" pad={2} className="docs-feature">
      <Surface level="section" radius="auto" className="docs-feature-visual">
        {visualOf(visual)}
      </Surface>
      <Stack gap={3} className="docs-feature-text">
        {children}
      </Stack>
    </Surface>
  );
}
