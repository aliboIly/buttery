import type { ReactElement } from "react";
import { SwatchGrid } from "@buttery/react";

type Brand = "ink" | "sky" | "moss" | "clay";

/** A few colors of your own, typed to their values, in rows of four. */
export function BrandColors({
  value,
  onValueChange,
}: {
  readonly value: Brand;
  readonly onValueChange: (value: Brand) => void;
}): ReactElement {
  return (
    <SwatchGrid<Brand>
      label="Accent"
      columns={4}
      value={value}
      onValueChange={onValueChange}
      swatches={[
        { value: "ink", label: "Ink", fill: "#1f2937" },
        { value: "sky", label: "Sky", fill: "#7dd3fc" },
        { value: "moss", label: "Moss", fill: "#86a873" },
        { value: "clay", label: "Clay", fill: "#c08460" },
      ]}
    />
  );
}
