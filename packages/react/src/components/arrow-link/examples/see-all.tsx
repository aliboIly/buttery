import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import { ArrowLink } from "@buttery/react";

/** A short list with a See all link at its foot. */
export function SeeAll(): ReactElement {
  return (
    <Stack gap={3} align="start">
      <Stack gap={1}>
        <Text variant="label">Spring launch</Text>
        <Text variant="label">Studio open day</Text>
        <Text variant="label">Winter catalog</Text>
      </Stack>
      <ArrowLink href="#/arrow-link">See all cards</ArrowLink>
    </Stack>
  );
}
