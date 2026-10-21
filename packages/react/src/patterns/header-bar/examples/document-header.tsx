import { useState } from "react";
import type { ReactElement } from "react";
import { HeaderBar, IconButton, toast } from "@buttery/react";
import { Redo2, Trash2, Undo2 } from "lucide-react";

/** A document's header: actions that fold into More, then undo and redo after a separator. */
export function DocumentHeader(): ReactElement {
  const [past, setPast] = useState(2);
  const [future, setFuture] = useState(0);
  return (
    <HeaderBar title="Spring launch" dragRegion>
      <HeaderBar.Actions>
        <HeaderBar.Action
          label="Rename"
          onSelect={() => {
            toast("Rename isn't part of this example", { id: "rename" });
          }}
        />
        <HeaderBar.Action
          label="Delete"
          icon={Trash2}
          iconOnly
          onSelect={() => {
            toast("Spring launch deleted", { id: "delete" });
          }}
        />
      </HeaderBar.Actions>
      <HeaderBar.Separator />
      <IconButton
        icon={Undo2}
        label="Undo"
        aria-disabled={past === 0}
        onClick={() => {
          if (past === 0) return;
          setPast(past - 1);
          setFuture(future + 1);
        }}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        aria-disabled={future === 0}
        onClick={() => {
          if (future === 0) return;
          setFuture(future - 1);
          setPast(past + 1);
        }}
      />
    </HeaderBar>
  );
}
