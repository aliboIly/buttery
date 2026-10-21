import { Stack, Text } from "@buttery/core";
import type { ExamplePlay } from "@buttery/core";
import { Button, DetailPage } from "@buttery/react";
import { useState } from "react";
import type { ReactElement } from "react";

/** A green coffee lot: what's left in the main column, reordering it the aside's primary action. */
export function GreenCoffeeLot(): ReactElement {
  const [kilos, setKilos] = useState(180);
  return (
    <DetailPage
      title="Nyeri AA"
      description="Washed, from the Gatomboya cooperative"
      action={
        <Button
          variant="primary"
          onClick={() => {
            setKilos((current) => current + 300);
          }}
        >
          Reorder 300 kg
        </Button>
      }
      aside={
        <DetailPage.Links
          title="Notes"
          links={[
            { label: "Cupping notes", href: "/stock/nyeri/cupping" },
            { label: "Roast profile", href: "/stock/nyeri/profile" },
          ]}
        />
      }
    >
      <Stack gap={2}>
        <Text variant="title-lg">{`${String(kilos)} kg on hand`}</Text>
        <Text variant="body-sm">
          About nine days of roasting at this week's pace.
        </Text>
      </Stack>
    </DetailPage>
  );
}

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Reorder 300 kg");
  await see("480 kg on hand");
};
