import { useState } from "react";
import type { ReactElement } from "react";
import { Grid, Inline, Layer, Surface, Text } from "@buttery/core";

/** A non-interactive overlay in the dev layer that shows twelve columns over the page. */
export function DesignGrid(): ReactElement {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Inline gap={2} padY={1} asChild>
        <label>
          <input
            type="checkbox"
            checked={visible}
            onChange={(event) => {
              setVisible(event.target.checked);
            }}
          />
          <Text>Show columns</Text>
        </label>
      </Inline>
      {visible ? (
        <Layer band="dev">
          <Grid
            columns={12}
            gap={6}
            padX={8}
            aria-hidden="true"
            style={{ blockSize: "100%", pointerEvents: "none" }}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <Surface key={index} level="inset" />
            ))}
          </Grid>
        </Layer>
      ) : null}
    </>
  );
}
