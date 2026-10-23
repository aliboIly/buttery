import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Pressable, Skeleton, Stack, Surface, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

const COUNTS = ["1,284", "1,312", "1,347"] as const;

/** A metric that shows a skeleton where its value goes until the value arrives, and again while it refreshes. */
export function LoadingMetric(): ReactElement {
  const [loads, setLoads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);

  return (
    <Surface level="card" pad={4}>
      <Stack gap={4} align="start">
        <Stack gap={2} aria-busy={loading}>
          <Text tone="secondary">Wholesale orders</Text>
          {loading ? (
            <Skeleton variant="title-lg" text="0,000" />
          ) : (
            <Text variant="title-lg" tabular>
              {COUNTS[loads % COUNTS.length]}
            </Text>
          )}
        </Stack>
        <Surface asChild level="raised" padX={4} padY={2} radius="full">
          <Pressable
            aria-disabled={loading}
            onClick={() => {
              setLoads(loads + 1);
              setLoading(true);
            }}
          >
            <Text variant="button">Refresh</Text>
          </Pressable>
        </Surface>
      </Stack>
    </Surface>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("1,284");
  await press("button", "Refresh");
  await see("1,312");
};
