import type { ReactElement } from "react";
import { gradientCss, gradients } from "@buttery/core/palettes";
import {
  Inspector,
  SegmentedControl,
  Slider,
  SwatchGrid,
  TextField,
  ValueBadge,
} from "@buttery/react";
import type { Swatch } from "@buttery/react";
import { NEW_DESIGN, SHAPE_SIZES } from "./document.ts";
import type { Design, Shape } from "./document.ts";

const BACKDROPS: readonly Swatch[] = gradients.slice(0, 12).map((preset) => ({
  value: preset.id,
  label: preset.name,
  fill: gradientCss(preset),
}));

const SHAPES = [
  { value: "wide", label: "Wide" },
  { value: "square", label: "Square" },
  { value: "tall", label: "Tall" },
] as const satisfies readonly { value: Shape; label: string }[];

function sizeLabel(shape: Shape): string {
  const { width, height } = SHAPE_SIZES[shape];
  return `${String(width)} × ${String(height)}`;
}

/** How the inspector changes the design: a key, which joins changes into one undo step, and the new design. */
export type ChangeDesign = (key: string, design: Design) => void;

/** The design's settings: the card's title and corners, then the canvas's backdrop and shape. */
export function DesignInspector({
  design,
  onChange,
  onSeal,
}: {
  readonly design: Design;
  readonly onChange: ChangeDesign;
  /** Ends the open undo step, as a drag's last move or leaving the title field does. */
  readonly onSeal: () => void;
}): ReactElement {
  return (
    <Inspector label="Design settings">
      <Inspector.Section
        title="Card"
        resettable={
          design.title !== NEW_DESIGN.title ||
          design.corners !== NEW_DESIGN.corners
        }
        onReset={() => {
          onChange("reset-card", {
            ...design,
            title: NEW_DESIGN.title,
            corners: NEW_DESIGN.corners,
          });
          onSeal();
        }}
      >
        <Inspector.Row block>
          <TextField
            label="Title"
            value={design.title}
            onValueChange={(title) => {
              onChange("title", { ...design, title });
            }}
            onBlur={onSeal}
          />
        </Inspector.Row>
        <Inspector.Row>
          <Slider
            label="Corners"
            min={0}
            max={96}
            resetValue={NEW_DESIGN.corners}
            value={design.corners}
            onValueChange={(corners) => {
              onChange("corners", { ...design, corners });
            }}
            onValueCommit={onSeal}
          />
        </Inspector.Row>
      </Inspector.Section>
      <Inspector.Section
        title="Canvas"
        resettable={
          design.backdrop !== NEW_DESIGN.backdrop ||
          design.shape !== NEW_DESIGN.shape
        }
        onReset={() => {
          onChange("reset-canvas", {
            ...design,
            backdrop: NEW_DESIGN.backdrop,
            shape: NEW_DESIGN.shape,
          });
          onSeal();
        }}
      >
        <Inspector.Row label="Shape">
          <SegmentedControl<Shape>
            label="Shape"
            options={SHAPES}
            value={design.shape}
            onValueChange={(shape) => {
              onChange("shape", { ...design, shape });
              onSeal();
            }}
          />
        </Inspector.Row>
        <Inspector.Row label="Size">
          <ValueBadge reserve={SHAPES.map(({ value }) => sizeLabel(value))}>
            {sizeLabel(design.shape)}
          </ValueBadge>
        </Inspector.Row>
        <Inspector.Row block>
          <SwatchGrid
            label="Backdrop"
            columns={6}
            swatches={BACKDROPS}
            value={design.backdrop}
            onValueChange={(backdrop) => {
              onChange("backdrop", { ...design, backdrop });
              onSeal();
            }}
          />
        </Inspector.Row>
      </Inspector.Section>
    </Inspector>
  );
}
