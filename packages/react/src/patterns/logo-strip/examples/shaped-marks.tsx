import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, LogoStrip, Page, Section } from "@buttery/react";

type Shape = "circle" | "square" | "diamond";

const MARKS: readonly { readonly name: string; readonly shape: Shape }[] = [
  { name: "Halcyon", shape: "circle" },
  { name: "Ferro", shape: "square" },
  { name: "Saltmarsh", shape: "diamond" },
  { name: "Copperleaf", shape: "circle" },
  { name: "Wrenfield", shape: "square" },
  { name: "Northgate", shape: "diamond" },
];

function Wordmark({
  name,
  shape,
}: {
  readonly name: string;
  readonly shape: Shape;
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

/** Under a landing page's opening: a heading, the first four marks, and a button that shows the rest. */
export function ShapedMarks(): ReactElement {
  const [all, setAll] = useState(false);
  const shown = all ? MARKS : MARKS.slice(0, 4);
  return (
    <Page>
      <Section
        size="sm"
        align="center"
        title="Teams that make their decks with us"
      >
        <Stack gap={6}>
          <LogoStrip label="Teams that make their decks with us">
            {shown.map((mark) => (
              <LogoStrip.Mark key={mark.name}>
                <Wordmark name={mark.name} shape={mark.shape} />
              </LogoStrip.Mark>
            ))}
          </LogoStrip>
          <Inline justify="center">
            <Button
              variant="ghost"
              onClick={() => {
                setAll(!all);
              }}
            >
              {all ? "Show fewer" : `Show all ${String(MARKS.length)}`}
            </Button>
          </Inline>
        </Stack>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("Copperleaf");
  await press("button", "Show all 6");
  await see("Northgate");
};
