import { Skeleton, Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Lines of text",
    description:
      "Each line takes its role's height, trimmed like the text, and the width of its placeholder text.",
    render: () => (
      <Stack gap={3}>
        <Skeleton variant="label" text="Total sales" />
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
