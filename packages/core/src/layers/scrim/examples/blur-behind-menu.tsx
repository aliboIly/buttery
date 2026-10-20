import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Layer, Pressable, Scrim, Surface, Text } from "@buttery/core";

/** A blurred scrim for a menu that opens over page content. */
export function BlurBehindMenu(): ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        <Surface level="raised" padX={4} padY={2} radius="full">
          <Text variant="button">Products</Text>
        </Surface>
      </Pressable>
      {open ? (
        <Layer band="dropdown">
          <Scrim
            variant="blur"
            onClick={() => {
              setOpen(false);
            }}
          />
          <Inline justify="center" padY={16}>
            <Surface level="floating" padX={6} padY={4}>
              <Text variant="menu">Card Studio</Text>
            </Surface>
          </Inline>
        </Layer>
      ) : null}
    </>
  );
}
