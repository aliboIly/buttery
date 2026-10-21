import { Skeleton, Stack, Text } from "@buttery/core";
import type { ReactElement } from "react";

/** A metric that shows a skeleton where its value goes until the value arrives. */
export function LoadingMetric({
  value,
}: {
  readonly value?: string | undefined;
}): ReactElement {
  return (
    <Stack gap={2} aria-busy={value === undefined}>
      <Text tone="secondary">Wholesale orders</Text>
      {value === undefined ? (
        <Skeleton variant="title-lg" text="1,284" />
      ) : (
        <Text variant="title-lg" tabular>
          {value}
        </Text>
      )}
    </Stack>
  );
}
