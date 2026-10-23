import type { ReactElement, ReactNode } from "react";
import { Center, Inline, Stack, Surface, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { Bento, Button, ExpandableCard, Page, Section } from "@butteryui/react";
import type { BentoCardVariant, BentoSpan } from "@butteryui/react";

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
  background,
  children,
}: {
  readonly background: string;
  readonly children: ReactNode;
}): ReactElement {
  return (
    <div style={{ blockSize: "100%", paddingInline: "var(--bt-space-6)" }}>
      <Center
        style={{
          blockSize: "100%",
          background: fill(background),
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

const VARIANTS = ["elevated", "outline", "soft", "plain", "tinted"] as const;

function variantOf(value: unknown): BentoCardVariant {
  return demoChoice(value, VARIANTS);
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "Tilt it in 3D" },
    span: { kind: "choice", options: ["4", "6", "8", "12"], initial: "8" },
    variant: { kind: "choice", options: VARIANTS, initial: "elevated" },
  },
  render: ({ title, span, variant }) => (
    <Bento>
      <ExpandableCard
        title={String(title)}
        span={spanOf(span)}
        variant={variantOf(variant)}
        detail={
          <Text variant="body-lg">
            Steer the tilt pad and the picture tips toward you, up to 20 degrees
            each way.
          </Text>
        }
      >
        <Picture background="lilac">
          <Chip label="Product shot" tilt={-6} />
        </Picture>
      </ExpandableCard>
      <ExpandableCard
        title="Any size"
        span={4}
        variant={variantOf(variant)}
        detail={
          <Text variant="body-lg">
            Wide, standard, square or tall, or a size of your own.
          </Text>
        }
      >
        <Picture background="cream">
          <Chip label="16:9" />
        </Picture>
      </ExpandableCard>
    </Bento>
  ),
  code: ({ title, span, variant }) => {
    const look = variant === "elevated" ? "" : ` variant="${String(variant)}"`;
    return [
      "<Bento>",
      "  <ExpandableCard",
      `    title="${String(title)}"`,
      `    span={${String(span)}}`,
      ...(look === "" ? [] : [`   ${look}`]),
      '    detail={<Text variant="body-lg">Steer the tilt pad and the picture tips toward you, up to 20 degrees each way.</Text>}',
      "  >",
      "    <TiltPreview />",
      "  </ExpandableCard>",
      `  <ExpandableCard title="Any size" span={4}${look} detail={<SizesDetail />}>`,
      "    <SizesPreview />",
      "  </ExpandableCard>",
      "</Bento>",
    ].join("\n");
  },
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
              title="Tilt it in 3D"
              span={8}
              detail={
                <Stack gap={4}>
                  <Surface radius="lg" style={{ background: fill("lilac") }}>
                    <Center style={{ paddingBlock: "var(--bt-space-16)" }}>
                      <Chip label="Product shot" tilt={-12} />
                    </Center>
                  </Surface>
                  <Text variant="body-lg">
                    Steer the tilt pad and the picture tips toward you, up to 20
                    degrees each way.
                  </Text>
                  <Text variant="body">
                    The PDF draws the same turn, shadow and all.
                  </Text>
                  <Inline>
                    <Button variant="soft" arrow="forward">
                      Try the tilt pad
                    </Button>
                  </Inline>
                </Stack>
              }
            >
              <Picture background="lilac">
                <Chip label="Product shot" tilt={-6} />
              </Picture>
            </ExpandableCard>
            <ExpandableCard
              title="Any size"
              span={4}
              detail={
                <Stack gap={4}>
                  <Text variant="body-lg">
                    Wide, standard, square or tall, or a size of your own.
                  </Text>
                  <Inline gap={2}>
                    {["16:9", "4:3", "1:1", "9:16"].map((shape) => (
                      <Chip key={shape} label={shape} level="section" />
                    ))}
                  </Inline>
                </Stack>
              }
            >
              <Picture background="cream">
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
  {
    title: "Variants",
    description:
      "Each card draws itself as a Bento.Card does: outline, soft, tinted or plain, beside elevated above. Open, every one is a dialog on the dialog surface.",
    render: () => (
      <Page>
        <Section size="sm">
          <Bento>
            <ExpandableCard
              title="Every change kept"
              span={6}
              variant="outline"
              detail={
                <Text variant="body-lg">
                  Undo and redo remember every change to a deck, up to 100 steps
                  back.
                </Text>
              }
            >
              <Picture background="mint">
                <Chip label="outline" />
              </Picture>
            </ExpandableCard>
            <ExpandableCard
              title="Notes for the room"
              span={6}
              variant="soft"
              detail={
                <Text variant="body-lg">
                  Speaker notes show on your screen and never on the shared one.
                </Text>
              }
            >
              <Picture background="sky">
                <Chip label="soft" />
              </Picture>
            </ExpandableCard>
            <ExpandableCard
              title="A background for every talk"
              span={6}
              variant="tinted"
              detail={
                <Text variant="body-lg">
                  Twenty-four gradients and eighteen solid colors, each with
                  text that stays readable.
                </Text>
              }
            >
              <Picture background="peach">
                <Chip label="tinted" />
              </Picture>
            </ExpandableCard>
            <ExpandableCard
              title="Present from any screen"
              span={6}
              variant="plain"
              detail={
                <Text variant="body-lg">
                  Open the deck on a laptop, a tablet or the room's own display.
                </Text>
              }
            >
              <Picture background="lilac">
                <Chip label="plain" />
              </Picture>
            </ExpandableCard>
          </Bento>
        </Section>
      </Page>
    ),
  },
];
