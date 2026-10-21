import type { ReactElement } from "react";
import { Grid, OverflowCluster } from "@buttery/core";
import { HeaderBar, IconButton, NumberField, Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";
import { CircleHelp, Redo2, Trash2, Undo2 } from "lucide-react";
import { CardStudioMark } from "./CardStudioMark.tsx";
import { newCard } from "./state.ts";
import type { Card, Shape } from "./state.ts";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "1:1", label: "Square · 1:1" },
  { value: "4:3", label: "Classic · 4:3" },
  { value: "3:2", label: "Photo · 3:2" },
  { value: "16:9", label: "Wide · 16:9" },
  { value: "9:16", label: "Tall · 9:16" },
  { value: "fit", label: "Fit to card" },
];

/** The shape a new card gets, which the select shows while there's no card. */
const NEW_SHAPE = newCard().shape;

const NEXT_SHAPE: Readonly<Record<Shape, Exclude<Shape, "custom">>> = {
  "1:1": "4:3",
  "4:3": "3:2",
  "3:2": "16:9",
  "16:9": "9:16",
  "9:16": "fit",
  fit: "1:1",
  custom: "16:9",
};

function shapeLabel(shape: Shape): string {
  return SHAPES.find((option) => option.value === shape)?.label ?? shape;
}

/** Card Studio's header: resize, delete and the canvas shape, then undo, redo and help. */
export function StudioHeader({
  card,
  resizing,
  canUndo,
  canRedo,
  onResize,
  onDelete,
  onShape,
  onSize,
  onSizeCommit,
  onUndo,
  onRedo,
  onHelp,
}: {
  readonly card: Card | null;
  readonly resizing: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onResize: () => void;
  readonly onDelete: () => void;
  readonly onShape: (shape: Exclude<Shape, "custom">) => void;
  readonly onSize: (size: { width: number; height: number }) => void;
  readonly onSizeCommit: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onHelp: () => void;
}): ReactElement {
  const custom = card?.shape === "custom";
  const shape = card?.shape ?? NEW_SHAPE;
  const sizeLabel = card
    ? `${String(card.width)} × ${String(card.height)}`
    : "";
  return (
    <HeaderBar
      mark={<CardStudioMark />}
      title={card?.title ?? "No card"}
      dragRegion
    >
      <HeaderBar.Actions>
        <HeaderBar.Action
          label="Resize"
          priority={2}
          disabled={!card || resizing}
          onSelect={onResize}
        />
        <HeaderBar.Action
          label="Delete"
          icon={Trash2}
          iconOnly
          priority={1}
          disabled={!card}
          onSelect={onDelete}
        />
        <OverflowCluster.Item
          priority={3}
          menuItem={{
            label: `Canvas shape: ${custom ? sizeLabel : shapeLabel(shape)}`,
            disabled: !card,
            onSelect: () => {
              onShape(NEXT_SHAPE[shape]);
            },
          }}
        >
          <Select<Shape>
            label="Canvas shape"
            options={SHAPES}
            value={shape}
            valueLabel={custom ? sizeLabel : undefined}
            disabled={!card}
            onValueChange={(next) => {
              if (next !== "custom") onShape(next);
            }}
            footerLabel="Custom size"
            footer={
              card ? (
                <Grid columns={2} gap={2}>
                  <NumberField
                    label="Width"
                    labelPosition="top"
                    min={64}
                    max={8000}
                    value={card.width}
                    onValueChange={(width) => {
                      onSize({ width, height: card.height });
                    }}
                    onValueCommit={onSizeCommit}
                  />
                  <NumberField
                    label="Height"
                    labelPosition="top"
                    min={64}
                    max={8000}
                    value={card.height}
                    onValueChange={(height) => {
                      onSize({ width: card.width, height });
                    }}
                    onValueCommit={onSizeCommit}
                  />
                </Grid>
              ) : undefined
            }
          />
        </OverflowCluster.Item>
      </HeaderBar.Actions>
      <HeaderBar.Separator />
      <IconButton
        icon={Undo2}
        label="Undo"
        aria-disabled={!canUndo}
        onClick={onUndo}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        aria-disabled={!canRedo}
        onClick={onRedo}
      />
      <IconButton icon={CircleHelp} label="Help" onClick={onHelp} />
    </HeaderBar>
  );
}
