import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Sheet } from "@buttery/react";
import type { SheetSide, SheetSize } from "@buttery/react";

const SHEETS: readonly {
  readonly name: string;
  readonly side: SheetSide;
  readonly size: SheetSize;
  readonly about: string;
}[] = [
  {
    name: "End",
    side: "end",
    size: "sm",
    about: "400px wide at the window's end, the default.",
  },
  {
    name: "Start",
    side: "start",
    size: "sm",
    about: "400px wide at the window's start.",
  },
  {
    name: "Bottom",
    side: "bottom",
    size: "sm",
    about: "The window's width, as tall as what it holds.",
  },
  {
    name: "Wide",
    side: "end",
    size: "md",
    about: "560px wide at the window's end.",
  },
  {
    name: "Widest",
    side: "end",
    size: "lg",
    about: "880px wide at the window's end, never wider than the window.",
  },
];

/** A sheet from each side, and the two wider sizes a side sheet takes. */
export function SidesAndSizes(): ReactElement {
  return (
    <Inline gap={2} wrap>
      {SHEETS.map((sheet) => (
        <Sheet key={sheet.name}>
          <Sheet.Trigger asChild>
            <Button variant="soft">{sheet.name}</Button>
          </Sheet.Trigger>
          <Sheet.Content side={sheet.side} size={sheet.size}>
            <Sheet.Header
              title={`${sheet.name} sheet`}
              description={sheet.about}
            />
            <Sheet.Body>
              <Text variant="body" tone="secondary">
                Press Escape, the close button or the dimmed page to close it.
              </Text>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet>
      ))}
    </Inline>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, key, see }) => {
  await press("button", "Start");
  await see("400px wide at the window's start.");
  await key("Escape");
  await press("button", "Widest");
  await see("880px wide at the window's end, never wider than the window.");
  await press("button", "Close");
  await press("button", "Bottom");
  await see("The window's width, as tall as what it holds.");
};
