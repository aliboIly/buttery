import type { ReactElement } from "react";
import { PageDots } from "@buttery/react";

/** Dots read out in another language. */
export function TranslatedDots(): ReactElement {
  return (
    <PageDots
      count={3}
      value={1}
      label={(step, count) =>
        `Schritt ${String(step + 1)} von ${String(count)}`
      }
    />
  );
}
