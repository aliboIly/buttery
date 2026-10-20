import { Stack } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { TextArea } from "@buttery/react";

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
