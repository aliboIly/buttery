import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, MorphMenu, NavBar, SearchField } from "@buttery/react";

/** A guide site's bar with a search after its menus, which narrows first as the bar runs out of room and stays when the menus fold. */
export function WithSearch(): ReactElement {
  const [query, setQuery] = useState("");
  return (
    <Stack gap={4}>
      <NavBar
        brand={<a href="#guides">Trail guides</a>}
        search={
          <SearchField
            label="Search the guides"
            variant="soft"
            value={query}
            onValueChange={setQuery}
          />
        }
        actions={
          <Button asChild variant="primary" arrow="forward">
            <a href="#plan">Plan a trip</a>
          </Button>
        }
      >
        <MorphMenu.Item label="Regions">
          <MorphMenu.Column title="Most walked">
            <MorphMenu.Entry
              href="#coast"
              title="The coast"
              caption="Cliff paths and coves"
            />
            <MorphMenu.Entry
              href="#hills"
              title="The hills"
              caption="Ridges and long views"
            />
          </MorphMenu.Column>
        </MorphMenu.Item>
        <MorphMenu.Link href="#maps">Maps</MorphMenu.Link>
      </NavBar>
      <Text variant="body-sm" tone="secondary">
        {query === ""
          ? "Showing every guide"
          : `Guides that mention "${query}"`}
      </Text>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("Search the guides", "coast");
  await see('Guides that mention "coast"');
};
