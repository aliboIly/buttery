import { Stack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { TextArea } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "TextArea",
  description:
    "A labelled box for longer text that grows with what's typed up to a limit, then scrolls.",
  order: 100,
  status: "stable",
  since: "0.4.5",
};

const LONG = Array.from(
  { length: 12 },
  (_, line) => `Line ${String(line + 1)} of a long note.`,
).join("\n");

export const demos: readonly DemoSection[] = [
  {
    title: "Grows, then scrolls",
    description:
      "Three lines when empty; it grows with the text up to eight, then scrolls with faded edges.",
    render: () => (
      <Stack gap={4}>
        <TextArea label="Note" hint="Shown under the card." />
        <TextArea label="Long note" defaultValue={LONG} />
        <TextArea
          label="Caption"
          defaultValue="Too long"
          error="Keep it under 280 characters."
        />
      </Stack>
    ),
  },
];
