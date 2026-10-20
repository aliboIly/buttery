import type { ReactElement } from "react";
import { Grid, Surface, Text } from "@buttery/core";
import type { DemoSection, GridColumns } from "@buttery/core";

function Cell({ label }: { readonly label: string }): ReactElement {
  return (
    <Surface level="raised" padX={3} padY={2}>
      <Text variant="label" truncate>
        {label}
      </Text>
    </Surface>
  );
}

const COUNTS: readonly GridColumns[] = [2, 3, 6];

export const demos: readonly DemoSection[] = [
  {
    title: "Columns",
    description: "Equal columns that never widen for long content.",
    render: () => (
      <Grid columns={1} gap={6}>
        {COUNTS.map((columns) => (
          <Grid key={columns} columns={columns} gap={2}>
            {Array.from({ length: columns }, (_, index) => (
              <Cell
                key={index}
                label={
                  index === 0
                    ? `${String(columns)} columns with a long label`
                    : `Cell ${String(index + 1)}`
                }
              />
            ))}
          </Grid>
        ))}
      </Grid>
    ),
  },
];
