import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Page, Section } from "@buttery/react";

const ROASTS = [
  {
    id: "guji",
    name: "Guji",
    origin: "Ethiopia",
    notes: "Peach and black tea",
  },
  {
    id: "huila",
    name: "Huila",
    origin: "Colombia",
    notes: "Red apple and caramel",
  },
  {
    id: "cerrado",
    name: "Cerrado",
    origin: "Brazil",
    notes: "Cocoa and hazelnut",
  },
] as const;

/** A shop page's band: a heading over this week's three coffees, each added to the order from its card. */
export function WeeklyRoasts(): ReactElement {
  const [bags, setBags] = useState(0);
  return (
    <Page>
      <Section
        size="sm"
        title="Roasted this week"
        body="Three coffees, roasted on Monday and sent out by Friday."
      >
        <Stack gap={4}>
          <Grid columns={{ base: 1, md: 3 }} gap={4}>
            {ROASTS.map((roast) => (
              <Surface key={roast.id} level="card" pad={5}>
                <Stack gap={3} align="start">
                  <Stack gap={1}>
                    <Text variant="title-sm">{`${roast.name}, ${roast.origin}`}</Text>
                    <Text variant="body-sm" tone="secondary">
                      {roast.notes}
                    </Text>
                  </Stack>
                  <Button
                    size="sm"
                    onClick={() => {
                      setBags(bags + 1);
                    }}
                  >
                    {`Add ${roast.name}`}
                  </Button>
                </Stack>
              </Surface>
            ))}
          </Grid>
          <Text variant="body" tone="secondary">
            {bags === 1
              ? "1 bag in your order"
              : `${String(bags)} bags in your order`}
          </Text>
        </Stack>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add Guji");
  await see("1 bag in your order");
  await press("button", "Add Cerrado");
  await see("2 bags in your order");
};
