import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { IconButton, LoadingPill } from "@buttery/react";

const WEEKS = [
  { week: 39, revenue: "$10,870" },
  { week: 40, revenue: "$11,960" },
  { week: 41, revenue: "$12,480" },
];

/** A revenue card that keeps its size while another week's numbers load, the pill centered in the box. */
export function ChartLoading(): ReactElement {
  const [index, setIndex] = useState(WEEKS.length - 1);
  const [loading, setLoading] = useState(false);
  const shown = WEEKS[index];
  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);
  const go = (next: number): void => {
    setIndex(next);
    setLoading(true);
  };
  return (
    <Surface level="card" pad={4}>
      <Stack gap={3}>
        <Inline gap={2} align="center" justify="between">
          <Text variant="title-sm">{`Revenue, week ${String(shown?.week)}`}</Text>
          <Inline gap={1}>
            <IconButton
              icon={ChevronLeft}
              label="Previous week"
              size="sm"
              aria-disabled={index === 0}
              onClick={() => {
                go(index - 1);
              }}
            />
            <IconButton
              icon={ChevronRight}
              label="Next week"
              size="sm"
              aria-disabled={index === WEEKS.length - 1}
              onClick={() => {
                go(index + 1);
              }}
            />
          </Inline>
        </Inline>
        <Center style={{ blockSize: "var(--bt-bento-row)" }}>
          {loading ? (
            <LoadingPill label="Loading revenue" />
          ) : (
            <Text variant="title-lg" tabular>
              {shown?.revenue}
            </Text>
          )}
        </Center>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("$12,480");
  await press("button", "Previous week");
  await see("Loading revenue");
  await see("$11,960");
};
