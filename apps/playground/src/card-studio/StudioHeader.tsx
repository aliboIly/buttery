import type { ReactElement } from "react";
import { Grid, OverflowCluster } from "@buttery/core";
import { HeaderBar, IconButton, NumberField, Select } from "@buttery/react";
import type { SelectOption } from "@buttery/react";
import { CircleHelp, Redo2, Trash2, Undo2 } from "lucide-react";
import { CardStudioMark } from "./CardStudioMark.tsx";
import type { Card, Shape } from "./state.ts";

const SHAPES: readonly SelectOption<Shape>[] = [
  { value: "match", label: "Match card" },
  { value: "16:9", label: "16:9" },
  { value: "4:3", label: "4:3" },
  { value: "1:1", label: "1:1" },
  { value: "3:2", label: "3:2" },
  { value: "9:16", label: "9:16" },
];

const NEXT_SHAPE: Readonly<Record<Shape, Exclude<Shape, "custom">>> = {
  match: "16:9",
  "16:9": "4:3",
  "4:3": "1:1",
  "1:1": "3:2",
  "3:2": "9:16",
  "9:16": "match",
  custom: "16:9",
};

/** Card Studio's header: crop, delete and the canvas shape, then undo, redo and help. */
export function StudioHeader({
  card,
  canUndo,
  canRedo,
  onCrop,
  onDelete,
  onShape,
  onSize,
  onUndo,
  onRedo,
  onHelp,
}: {
  readonly card: Card | null;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onCrop: () => void;
  readonly onDelete: () => void;
  readonly onShape: (shape: Exclude<Shape, "custom">) => void;
  readonly onSize: (size: { width: number; height: number }) => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onHelp: () => void;
}): ReactElement {
  const custom = card?.shape === "custom";
  const sizeLabel = card
    ? `${String(card.width)} × ${String(card.height)}`
    : "";
  return (
    <HeaderBar
      mark={<CardStudioMark />}
      title={card?.title ?? "Untitled"}
      dragRegion
    >
      <HeaderBar.Actions>
        <HeaderBar.Action
          label="Crop"
          priority={2}
          disabled={!card}
          onSelect={onCrop}
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
            label: `Canvas shape: ${custom ? sizeLabel : (card?.shape ?? "16:9")}`,
            disabled: !card,
            onSelect: () => {
              onShape(NEXT_SHAPE[card?.shape ?? "16:9"]);
            },
          }}
        >
          <Select<Shape>
            label="Canvas shape"
            options={SHAPES}
            value={card?.shape}
            valueLabel={custom ? sizeLabel : undefined}
            disabled={!card}
            onValueChange={(shape) => {
              if (shape !== "custom") onShape(shape);
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
        disabled={!canUndo}
        onClick={onUndo}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        disabled={!canRedo}
        onClick={onRedo}
      />
      <IconButton icon={CircleHelp} label="Help" onClick={onHelp} />
    </HeaderBar>
  );
}
