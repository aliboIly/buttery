import type { ReactElement } from "react";
import { OverflowCluster } from "@buttery/core";
import { Button, HeaderBar, IconButton, Select } from "@buttery/react";
import {
  CircleHelp,
  ClipboardCopy,
  CopyPlus,
  Download,
  Move,
  PenLine,
  Play,
  Ratio,
  Redo2,
  Trash2,
  Undo2,
} from "lucide-react";
import { DeckhandMark } from "./DeckhandMark.tsx";
import { SIZE_OPTIONS } from "./deck.ts";
import type { SlideSize } from "./deck.ts";

function sizeLabel(size: SlideSize): string {
  return SIZE_OPTIONS.find((option) => option.value === size)?.label ?? size;
}

function nextSize(size: SlideSize): SlideSize {
  const index = SIZE_OPTIONS.findIndex((option) => option.value === size);
  return SIZE_OPTIONS[(index + 1) % SIZE_OPTIONS.length]?.value ?? size;
}

/** Deckhand's header: the deck's name, then Present, the slide size and the slide's actions, then undo, redo and help. */
export function DeckHeader({
  name,
  size,
  hasSlide,
  arranging,
  canUndo,
  canRedo,
  onPresent,
  onSize,
  onArrange,
  onExport,
  onCopy,
  onDuplicate,
  onDelete,
  onRename,
  onUndo,
  onRedo,
  onHelp,
}: {
  readonly name: string;
  readonly size: SlideSize;
  readonly hasSlide: boolean;
  /** Whether arrange mode is on, which presses Arrange; pressing it again ends the mode. */
  readonly arranging: boolean;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  /** Starts the presentation, from the button that started it, which focus goes back to after. */
  readonly onPresent: (trigger?: HTMLElement) => void;
  readonly onSize: (size: SlideSize) => void;
  readonly onArrange: () => void;
  readonly onExport: () => void;
  readonly onCopy: () => void;
  readonly onDuplicate: () => void;
  readonly onDelete: () => void;
  readonly onRename: () => void;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onHelp: () => void;
}): ReactElement {
  return (
    <HeaderBar mark={<DeckhandMark />} title={name} dragRegion>
      <HeaderBar.Actions>
        <OverflowCluster.Item
          priority={4}
          menuItem={{
            label: arranging ? "Done arranging" : "Arrange",
            icon: Move,
            disabled: !hasSlide,
            onSelect: onArrange,
          }}
        >
          <Button
            variant={arranging ? "soft" : "ghost"}
            aria-pressed={arranging}
            aria-disabled={!hasSlide || undefined}
            onClick={() => {
              if (hasSlide) onArrange();
            }}
          >
            Arrange
          </Button>
        </OverflowCluster.Item>
        <HeaderBar.Action
          label="Duplicate slide"
          icon={CopyPlus}
          iconOnly
          priority={2}
          disabled={!hasSlide}
          onSelect={onDuplicate}
        />
        <HeaderBar.Action
          label="Delete slide"
          icon={Trash2}
          iconOnly
          priority={6}
          disabled={!hasSlide}
          onSelect={onDelete}
        />
        <HeaderBar.Action
          label="Rename deck"
          icon={PenLine}
          iconOnly
          priority={1}
          onSelect={onRename}
        />
        <OverflowCluster.Item
          priority={7}
          menuItem={{
            label: `Slide size: ${sizeLabel(size)}`,
            icon: Ratio,
            onSelect: () => {
              onSize(nextSize(size));
            },
          }}
        >
          <Select<SlideSize>
            label="Slide size"
            options={SIZE_OPTIONS}
            value={size}
            onValueChange={onSize}
          />
        </OverflowCluster.Item>
        <HeaderBar.Action
          label="Copy as image"
          icon={ClipboardCopy}
          iconOnly
          priority={3}
          disabled={!hasSlide}
          onSelect={onCopy}
        />
        <HeaderBar.Action
          label="Export PNG"
          icon={Download}
          iconOnly
          priority={5}
          disabled={!hasSlide}
          onSelect={onExport}
        />
        <OverflowCluster.Item
          priority={8}
          menuItem={{
            label: "Present",
            icon: Play,
            disabled: !hasSlide,
            onSelect: () => {
              onPresent();
            },
          }}
        >
          <Button
            variant="primary"
            iconStart={Play}
            aria-disabled={!hasSlide || undefined}
            onClick={(event) => {
              if (hasSlide) onPresent(event.currentTarget);
            }}
          >
            Present
          </Button>
        </OverflowCluster.Item>
      </HeaderBar.Actions>
      <HeaderBar.Separator />
      <IconButton
        icon={Undo2}
        label="Undo"
        aria-disabled={!canUndo || undefined}
        onClick={onUndo}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        aria-disabled={!canRedo || undefined}
        onClick={onRedo}
      />
      <IconButton icon={CircleHelp} label="Help" onClick={onHelp} />
    </HeaderBar>
  );
}
