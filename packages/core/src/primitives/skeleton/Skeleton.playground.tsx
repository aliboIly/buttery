import { Skeleton, Stack } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Skeleton",
  description:
    "A shimmering placeholder for something still loading, shaped like the text or block it stands in for.",
  order: 90,
  status: "new",
  since: "0.7.0",
};

const VARIANTS = [
  "title-lg",
  "title-md",
  "title",
  "dialog-title",
  "title-sm",
  "label",
  "body",
  "body-sm",
  "button",
  "button-lg",
  "control",
  "menu",
  "badge",
  "caption",
  "kbd",
  "display",
  "heading-1",
  "heading-2",
  "body-lg",
] as const;

export const live: LiveDemo = {
  controls: {
    variant: { kind: "choice", options: VARIANTS, initial: "title-lg" },
    text: { kind: "text", initial: "$12,480.00" },
  },
  render: ({ variant, text }) => (
    <Skeleton
      variant={demoChoice(variant, VARIANTS)}
      text={String(text) === "" ? undefined : String(text)}
    />
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Lines of text",
    description:
      "Each line takes its role's height, trimmed like the text, and the width of its placeholder text.",
    render: () => (
      <Stack gap={3}>
        <Skeleton variant="label" text="Sales" />
        <Skeleton variant="title-lg" text="$12,480.00" />
        <Skeleton variant="body-sm" />
        <Skeleton variant="caption" text="Updated 4 min ago" />
      </Stack>
    ),
  },
  {
    title: "A block",
    description: "Without a variant, the CSS around it sets its size.",
    render: () => (
      <Skeleton style={{ inlineSize: "100%", blockSize: "var(--bt-h-cta)" }} />
    ),
  },
];
