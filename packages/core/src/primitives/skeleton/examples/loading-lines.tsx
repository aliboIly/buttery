import { Skeleton, Stack } from "@buttery/core";
import type { ReactElement } from "react";

/** Three lines standing in for a paragraph, the last one shorter. */
export function LoadingLines(): ReactElement {
  return (
    <Stack gap={2}>
      <Skeleton variant="body" />
      <Skeleton variant="body" />
      <Skeleton
        variant="body"
        text="Roasted on Tuesday, shipped the same afternoon"
      />
    </Stack>
  );
}
