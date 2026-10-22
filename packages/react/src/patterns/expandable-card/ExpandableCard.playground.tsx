import type { ReactElement, ReactNode } from "react";
import { Center, Inline, Stack, Surface, Text } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Bento, Button, ExpandableCard, Page, Section } from "@buttery/react";
import type { BentoSpan } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "ExpandableCard",
  description:
    "A bento card that opens into a dialog by turning into it, its title travelling along, and closes back into the card.",
  order: 50,
  status: "stable",
  since: "0.7.0",
};

function fill(id: string): string | undefined {
  const preset = gradients.find((candidate) => candidate.id === id);
  return preset ? gradientCss(preset) : undefined;
}

/** A picture rising from the bottom of a card, inset from its sides. */
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

function Chip({
  label,
  tilt = 0,
  level = "card",
}: {
  readonly label: string;
  readonly tilt?: number;
  readonly level?: "card" | "section";
}): ReactElement {
  return (
    <Surface
      level={level}
      padX={6}
      padY={4}
      style={tilt === 0 ? undefined : { rotate: `${String(tilt)}deg` }}
    >
      <Text variant="title">{label}</Text>
    </Surface>
  );
}

function spanOf(value: unknown): BentoSpan {
  switch (demoChoice(value, ["4", "6", "8", "12"])) {
    case "4":
      return 4;
    case "6":
      return 6;
    case "8":
      return 8;
    case "12":
      return 12;
  }
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Lean it in 3D" },
    span: { kind: "choice", options: ["4", "6", "8", "12"], initial: "8" },
  },
  render: ({ title, span }) => (
    <Bento>
      <ExpandableCard
        title={String(title)}
        span={spanOf(span)}
        detail={
          <Text variant="body-lg">
            Steer the lean pad and the card tips toward you, up to 20 degrees
            each way.
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
    </Bento>
  ),
  code: ({ title, span }) =>
    [
      "<Bento>",
      "  <ExpandableCard",
      `    title="${String(title)}"`,
      `    span={${String(span)}}`,
      '    detail={<Text variant="body-lg">Steer the lean pad and the card tips toward you, up to 20 degrees each way.</Text>}',
      "  >",
      "    <LeanPreview />",
      "  </ExpandableCard>",
      '  <ExpandableCard title="Any size" span={4} detail={<SizesDetail />}>',
      "    <SizesPreview />",
      "  </ExpandableCard>",
      "</Bento>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Cards that open",
    description:
      "The card grows into the dialog on spring.morph with its title travelling along; the others step back. Closing turns it back into the card on spring.smooth.",
    render: () => (
      <Page>
        <Section size="sm" tone="muted">
          <Bento>
            <ExpandableCard
              title="Lean it in 3D"
              span={8}
              detail={
                <Stack gap={4}>
                  <Surface radius="lg" style={{ background: fill("lilac") }}>
                    <Center style={{ paddingBlock: "var(--bt-space-16)" }}>
                      <Chip label="Launch card" tilt={-12} />
                    </Center>
                  </Surface>
                  <Text variant="body-lg">
                    Steer the lean pad and the card tips toward you, up to 20
                    degrees each way.
                  </Text>
                  <Text variant="body">
                    The export draws the same turn, shadow and all.
                  </Text>
                  <Inline>
                    <Button variant="soft" arrow="forward">
                      Try the lean pad
                    </Button>
                  </Inline>
                </Stack>
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
                <Stack gap={4}>
                  <Text variant="body-lg">
                    Square, classic, photo, wide or tall, or a size of your own.
                  </Text>
                  <Inline gap={2}>
                    {["1:1", "4:3", "3:2", "16:9", "9:16"].map((shape) => (
                      <Chip key={shape} label={shape} level="section" />
                    ))}
                  </Inline>
                </Stack>
              }
            >
              <Picture backdrop="cream">
                <Inline gap={2}>
                  <Chip label="1:1" />
                  <Chip label="16:9" />
                </Inline>
              </Picture>
            </ExpandableCard>
          </Bento>
        </Section>
      </Page>
    ),
  },
];
