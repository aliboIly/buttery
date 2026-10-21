import type { ReactElement } from "react";
import { Stagger, Surface, Text } from "@buttery/core";
import { Button, SplitHero } from "@buttery/react";

/** A product's opening band with one call to action and a visual of two pieces. */
export function ProductHero(): ReactElement {
  return (
    <SplitHero
      title="Cards that look finished."
      titleMore="Write a title, pick a finish, and export."
      actions={
        <Button variant="primary" arrow="forward">
          Open the studio
        </Button>
      }
      visual={
        <>
          <Stagger.Item>
            <Surface level="card" pad={8}>
              <Text variant="title">Launch card</Text>
            </Surface>
          </Stagger.Item>
          <Stagger.Item>
            <Surface level="section" pad={4}>
              <Text variant="label">Finish · Ink</Text>
            </Surface>
          </Stagger.Item>
        </>
      }
    />
  );
}
