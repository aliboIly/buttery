import type { ReactElement, ReactNode } from "react";
import { Center, Inline, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Bento, Page, Section } from "@buttery/react";

export const page: DocsPage = {
  section: "patterns",
  title: "Bento",
  description:
    "A grid of feature cards on a 12-column page grid, each spanning 4, 6, 8 or 12 columns and one or two rows.",
  order: 140,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
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

export const demos: readonly DemoSection[] = [
  {
    title: "Feature cards",
    description:
      "12 columns from 1024px of grid, 6 from 640, one below that, in 320px rows. Cards lift 2px on hover.",
    render: () => (
      <Page>
        <Section size="sm" tone="muted">
          <Bento>
            <Bento.Card title="Lean it in 3D" span={8}>
              <Picture backdrop="lilac">
                <Chip label="Launch card" tilt={-6} />
              </Picture>
            </Bento.Card>
            <Bento.Card title="Any size" span={4}>
              <Picture backdrop="cream">
                <Inline gap={2}>
                  <Chip label="1:1" />
                  <Chip label="16:9" />
                </Inline>
              </Picture>
            </Bento.Card>
            <Bento.Card title="A backdrop for every mood" span={4}>
              <Picture backdrop="sky">
                <Chip label="Blend" />
              </Picture>
            </Bento.Card>
            <Bento.Card title="Every change kept" span={8}>
              <Picture backdrop="mint">
                <Chip label="Undo · Redo" />
              </Picture>
            </Bento.Card>
          </Bento>
        </Section>
      </Page>
    ),
  },
];
