import type { ReactElement } from "react";
import { Copy } from "lucide-react";
import { Icon, Inline, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";

/** An icon and its label with the 6px icon gap. */
export function IconAndLabel(): ReactElement {
  return (
    <Inline gap={1.5}>
      <Icon icon={Copy} />
      <Text variant="button">Copy</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ see }) => {
  await see("Copy");
};
