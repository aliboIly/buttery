import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SegmentedControl, Sparkline } from "@buttery/react";

type Week = "this" | "last";

const ROASTS: readonly {
  readonly name: string;
  readonly bags: Readonly<Record<Week, readonly number[]>>;
}[] = [
  {
    name: "House blend",
    bags: {
      this: [18, 22, 19, 25, 27, 31, 29],
      last: [15, 17, 16, 20, 19, 24, 22],
    },
  },
  {
    name: "Single origin",
    bags: {
      this: [8, 9, 7, 11, 10, 12, 14],
      last: [9, 8, 10, 9, 11, 10, 9],
    },
  },
  {
    name: "Decaf",
    bags: { this: [4, 3, 5, 4, 2, 3, 4], last: [3, 4, 4, 5, 3, 2, 3] },
  },
];

/** A sales list with each roast's trend in its row, beside the total it adds up to; the week switch redraws every line. */
export function RoastSales(): ReactElement {
  const [week, setWeek] = useState<Week>("this");
  return (
    <Stack gap={4}>
      <SegmentedControl<Week>
        label="Week"
        options={[
          { value: "this", label: "This week" },
          { value: "last", label: "Last week" },
        ]}
        value={week}
        onValueChange={setWeek}
      />
      <Grid columns={3} gap={4} align="center">
        {ROASTS.map((roast) => {
          const days = roast.bags[week];
          const total = days.reduce((sum, bags) => sum + bags, 0);
          return [
            <Text key={`${roast.name}-name`} tone="secondary">
              {roast.name}
            </Text>,
            <Text key={`${roast.name}-total`} tabular>
              {total} bags
            </Text>,
            <Sparkline
              key={`${roast.name}-trend`}
              label={`${roast.name}, bags sold each day ${week} week`}
              values={days}
            />,
          ];
        })}
      </Grid>
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await see("171 bags");
  await press("radio", "Last week");
  await see("133 bags");
};
