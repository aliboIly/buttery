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
            toast("Card removed", { id: "delete" });
          }}
        />
      </HeaderBar.Actions>
      <HeaderBar.Separator />
      <IconButton
        icon={Undo2}
        label="Undo"
        disabled={past === 0}
        onClick={() => {
          setPast(past - 1);
          setFuture(future + 1);
        }}
      />
      <IconButton
        icon={Redo2}
        label="Redo"
        disabled={future === 0}
        onClick={() => {
          setFuture(future - 1);
          setPast(past + 1);
        }}
      />
    </HeaderBar>
  );
}
