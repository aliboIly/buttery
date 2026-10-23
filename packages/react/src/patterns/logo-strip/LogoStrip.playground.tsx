import type { ReactElement } from "react";
import type { DemoSection, DocsPage } from "@butteryui/core";
import { LogoStrip, Page, Section } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "LogoStrip",
  description:
    "A row of partner or customer marks in equal cells, each fitted into a 120 by 24 box and drawn in one quiet color.",
  order: 210,
  status: "stable",
  since: "0.7.0",
  home: "patterns/marketing-page",
};

function Wordmark({
  name,
  shape,
}: {
  readonly name: string;
  readonly shape: "circle" | "square" | "diamond";
}): ReactElement {
  return (
    <svg viewBox="0 0 120 24" role="img" aria-label={name}>
      {shape === "circle" ? (
        <circle cx="10" cy="12" r="8" fill="currentColor" />
      ) : shape === "square" ? (
        <rect x="2" y="4" width="16" height="16" rx="4" fill="currentColor" />
      ) : (
        <rect
          x="4"
          y="4"
          width="12"
          height="12"
          rx="2"
          fill="currentColor"
          transform="rotate(45 10 10)"
        />
      )}
      <text x="26" y="17" fontSize="14" fontWeight="600" fill="currentColor">
        {name}
      </text>
    </svg>
  );
}

const MARKS = [
  ["Tidewater", "circle"],
  ["Bramble", "square"],
  ["Quillwork", "diamond"],
  ["Halcyon", "circle"],
  ["Ferro", "square"],
  ["Lumen", "diamond"],
] as const;

export const demos: readonly DemoSection[] = [
  {
    title: "Six marks",
    description:
      "Each fits a 120 by 24 box in text-tertiary; the cells wrap as the page narrows.",
    render: () => (
      <Page>
        <Section size="sm">
          <LogoStrip label="Teams that present with Deckhand">
            {MARKS.map(([name, shape]) => (
              <LogoStrip.Mark key={name}>
                <Wordmark name={name} shape={shape} />
              </LogoStrip.Mark>
            ))}
          </LogoStrip>
        </Section>
      </Page>
    ),
  },
];
