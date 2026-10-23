import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Surface, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, Page, Section } from "@buttery/react";

const TEMPLATES = [
  {
    id: "quarterly-review",
    name: "Quarterly review",
    slides: "12 slides",
    notes: "Numbers, charts and a summary",
  },
  {
    id: "team-offsite",
    name: "Team offsite",
    slides: "8 slides",
    notes: "Agenda, schedule and a map",
  },
  {
    id: "hiring-plan",
    name: "Hiring plan",
    slides: "10 slides",
    notes: "Roles, timeline and budget",
  },
] as const;

/** A templates page's band: a heading over this week's three new templates, each added to the library from its card. */
export function NewTemplates(): ReactElement {
  const [added, setAdded] = useState(0);
  return (
    <Page>
      <Section
        size="sm"
        title="New this week"
        body="Three templates, each a deck you can make your own."
      >
        <Stack gap={4}>
          <Grid columns={{ base: 1, md: 3 }} gap={4}>
            {TEMPLATES.map((template) => (
              <Surface key={template.id} level="card" pad={5}>
                <Stack gap={3} align="start">
                  <Stack gap={1}>
                    <Text variant="title-sm">{`${template.name}, ${template.slides}`}</Text>
                    <Text variant="body-sm" tone="secondary">
                      {template.notes}
                    </Text>
                  </Stack>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAdded(added + 1);
                    }}
                  >
                    {`Add ${template.name}`}
                  </Button>
                </Stack>
              </Surface>
            ))}
          </Grid>
          <Text variant="body" tone="secondary">
            {added === 1
              ? "1 template in your library"
              : `${String(added)} templates in your library`}
          </Text>
        </Stack>
      </Section>
    </Page>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add Quarterly review");
  await see("1 template in your library");
  await press("button", "Add Hiring plan");
  await see("2 templates in your library");
};
