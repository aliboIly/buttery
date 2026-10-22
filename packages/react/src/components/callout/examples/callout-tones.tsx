import type { ReactElement } from "react";
import { Stack } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { ArrowLink, Callout } from "@buttery/react";

/** The four tones, each with its tint and icon: something to know, a result, a warning and an error. */
export function CalloutTones(): ReactElement {
  return (
    <Stack gap={3}>
      <Callout title="Prices change on the 1st">
        Subscriptions renew at the new price from next month.
      </Callout>
      <Callout tone="success" title="Card exported">
        It&apos;s in your downloads as a PNG.
      </Callout>
      <Callout
        tone="warning"
        title="Large export"
        action={<ArrowLink href="#export-size">Pick a smaller size</ArrowLink>}
      >
        At this size the file will be over 20 MB.
      </Callout>
      <Callout tone="danger" title="Couldn't publish">
        The shop is offline. Try again in a few minutes.
      </Callout>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ see }) => {
  await see("Prices change on the 1st");
  await see("Couldn't publish");
};
