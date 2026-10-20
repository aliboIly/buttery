import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Button, toast } from "@buttery/react";

/** News the person didn't just cause, read out at the next pause: a sync that finishes on its own. */
export function SyncToast(): ReactElement {
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (!syncing) return undefined;
    const timer = window.setTimeout(() => {
      setSyncing(false);
      toast("All cards synced", { background: true });
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [syncing]);

  return (
    <Button
      loading={syncing}
      onClick={() => {
        setSyncing(true);
      }}
    >
      Sync now
    </Button>
  );
}
