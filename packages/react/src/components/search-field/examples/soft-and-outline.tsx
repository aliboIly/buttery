import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { SearchField } from "@butteryui/react";

/** Soft for a top bar's search, with its / shortcut, and outline for a toolbar's filter; Enter sends either one. */
export function SoftAndOutline(): ReactElement {
  const [last, setLast] = useState("Nothing searched yet");
  const searchFor =
    (scope: string) =>
    (event: SubmitEvent<HTMLFormElement>): void => {
      event.preventDefault();
      const query = new FormData(event.currentTarget).get("q");
      if (typeof query === "string" && query.trim() !== "")
        setLast(`${scope} “${query.trim()}”`);
    };
  return (
    <Stack gap={4}>
      <form role="search" onSubmit={searchFor("Searched everything for")}>
        <SearchField
          variant="soft"
          label="Search everything"
          shortcut="/"
          name="q"
        />
      </form>
      <form role="search" onSubmit={searchFor("Filtered orders by")}>
        <SearchField label="Filter orders" name="q" />
      </form>
      <Text variant="body-sm" tone="secondary">
        {last}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ type, key, see }) => {
  await type("Search everything", "guji");
  await key("Enter");
  await see("Searched everything for “guji”");
  await type("Filter orders", "pier");
  await key("Enter");
  await see("Filtered orders by “pier”");
};
