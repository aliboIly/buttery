import type { ReactElement, ReactNode } from "react";
import { HeaderBar, IconButton } from "@buttery/react";
import { Redo2, Trash2, Undo2 } from "lucide-react";

/** A document's header: actions that fold into More, then undo and redo after a separator. */
export function DocumentHeader({
  mark,
  name,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onRename,
  onDelete,
}: {
  readonly mark: ReactNode;
  readonly name: string;
  readonly canUndo: boolean;
  readonly canRedo: boolean;
  readonly onUndo: () => void;
  readonly onRedo: () => void;
  readonly onRename: () => void;
  readonly onDelete: () => void;
}): ReactElement {
  return (
    <HeaderBar mark={mark} title={name} dragRegion>
      <HeaderBar.Actions>
        <HeaderBar.Action label="Rename" onSelect={onRename} />
        <HeaderBar.Action
          label="Delete"
          icon={Trash2}
          iconOnly
          onSelect={onDelete}
        />
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
    </HeaderBar>
  );
}
