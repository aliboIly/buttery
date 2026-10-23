import type { ReactElement } from "react";
import { Inline, Stack, Text, demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, Sheet } from "@buttery/react";
import type { ResponsiveSheetSide, SheetSide, SheetSize } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Sheet",
  description:
    "A panel that slides in from an edge of the window over a dimmed page: a side panel on a laptop and a drawer on a phone.",
  order: 105,
  status: "new",
  since: "0.9.0",
};

const SIDES = ["end", "start", "bottom", "responsive"] as const;
const SIZES = ["sm", "md", "lg"] as const;

type DemoSide = (typeof SIDES)[number];

const WIDTHS: Readonly<Record<SheetSize, string>> = {
  sm: "400",
  md: "560",
  lg: "880",
};

function sideOf(side: DemoSide): SheetSide | ResponsiveSheetSide {
  return side === "responsive" ? { base: "bottom", md: "end" } : side;
}

function sideCode(side: DemoSide): string {
  return side === "responsive"
    ? 'side={{ base: "bottom", md: "end" }}'
    : `side="${side}"`;
}

function where(side: DemoSide, size: SheetSize): string {
  const width = WIDTHS[size];
  switch (side) {
    case "end":
      return `Slides in at the window's end, ${width}px wide.`;
    case "start":
      return `Slides in at the window's start, ${width}px wide.`;
    case "bottom":
      return "Rises from the bottom, as wide as the window and as tall as its content.";
    case "responsive":
      return `Rises from the bottom under 640px of window, and slides in at the end, ${width}px wide, from 640px.`;
    default: {
      const unknown: never = side;
      return unknown;
    }
  }
}

function Roast({
  side,
  size,
  trigger,
}: {
  readonly side: SheetSide | ResponsiveSheetSide;
  readonly size?: SheetSize;
  readonly trigger: string;
}): ReactElement {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button variant="soft">{trigger}</Button>
      </Sheet.Trigger>
      <Sheet.Content side={side} size={size}>
        <Sheet.Header
          title="Tomorrow's roast"
          description="Four coffees go in the drum at seven."
        />
        <Sheet.Body>
          <Stack gap={3}>
            <Text variant="label">Guji, Ethiopia</Text>
            <Text variant="body-sm" tone="secondary">
              Light. 18 bags for subscriptions, 6 for the shop.
            </Text>
          </Stack>
          <Stack gap={3}>
            <Text variant="label">Huila, Colombia</Text>
            <Text variant="body-sm" tone="secondary">
              Medium. 12 bags, 4 of them ground for espresso.
            </Text>
          </Stack>
        </Sheet.Body>
        <Sheet.Footer>
          <Sheet.Close asChild>
            <Button variant="primary" size="cta" shape="rounded">
              Done
            </Button>
          </Sheet.Close>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet>
  );
}

export const live: LiveDemo = {
  controls: {
    side: { kind: "choice", options: SIDES, initial: "end" },
    size: { kind: "choice", options: SIZES, initial: "sm" },
  },
  render: ({ side, size }) => {
    const edge = demoChoice(side, SIDES);
    const width = demoChoice(size, SIZES);
    return (
      <Stack gap={2} align="start">
        <Roast side={sideOf(edge)} size={width} trigger="Tomorrow's roast" />
        <Text variant="caption">{where(edge, width)}</Text>
      </Stack>
    );
  },
  code: ({ side, size }) => {
    const edge = demoChoice(side, SIDES);
    const width = demoChoice(size, SIZES);
    return [
      "<Sheet>",
      "  <Sheet.Trigger asChild>",
      '    <Button variant="soft">Tomorrow\'s roast</Button>',
      "  </Sheet.Trigger>",
      `  <Sheet.Content ${sideCode(edge)}${width === "sm" ? "" : ` size="${width}"`}>`,
      "    <Sheet.Header",
      '      title="Tomorrow\'s roast"',
      '      description="Four coffees go in the drum at seven."',
      "    />",
      "    <Sheet.Body>…</Sheet.Body>",
      "    <Sheet.Footer>",
      "      <Sheet.Close asChild>",
      '        <Button variant="primary" size="cta" shape="rounded">Done</Button>',
      "      </Sheet.Close>",
      "    </Sheet.Footer>",
      "  </Sheet.Content>",
      "</Sheet>",
    ].join("\n");
  },
};

export const demos: readonly DemoSection[] = [
  {
    title: "Sides",
    description:
      "It slides in from its edge on spring.smooth over a scrim that fades in over dur-base, and leaves over dur-fast. At the bottom it's a drawer with a handle to drag it down by.",
    render: () => (
      <Inline gap={2} wrap>
        <Roast side="end" trigger="At the end" />
        <Roast side="start" trigger="At the start" />
        <Roast side="bottom" trigger="From the bottom" />
      </Inline>
    ),
  },
  {
    title: "A drawer on a phone, a side panel from 640px",
    description:
      'With side={{ base: "bottom", md: "end" }} one sheet rises from the bottom of a narrow window and slides in at the end of a wider one.',
    render: () => (
      <Roast
        side={{ base: "bottom", md: "end" }}
        trigger="Open tomorrow's roast"
      />
    ),
  },
  {
    title: "Sizes",
    description:
      "A side sheet is 400, 560 or 880px wide, the widths a dialog has, and never wider than the window less 16px.",
    render: () => (
      <Inline gap={2} wrap>
        <Roast side="end" size="md" trigger="Medium" />
        <Roast side="end" size="lg" trigger="Large" />
      </Inline>
    ),
  },
];
