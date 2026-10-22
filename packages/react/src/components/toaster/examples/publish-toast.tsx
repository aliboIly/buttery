import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button, toast } from "@buttery/react";

/** A publish kept in one toast by the id toast() returns, and canceled with toast.dismiss(id); ButteryProvider mounts the Toaster, so there's none to render. */
export function PublishToast(): ReactElement {
  const [publishing, setPublishing] = useState<string | null>(null);
  const [status, setStatus] = useState("Not published yet");

  useEffect(() => {
    if (publishing === null) return undefined;
    const timer = window.setTimeout(() => {
      setPublishing(null);
      setStatus("Published");
      toast.success("Card published", { id: publishing });
    }, 1500);
    return () => {
      window.clearTimeout(timer);
    };
  }, [publishing]);

  return (
    <Inline gap={3} align="center">
      <Button
        variant="primary"
        aria-disabled={publishing !== null}
        onClick={() => {
          setStatus("Publishing");
          setPublishing(
            toast("Publishing the card", {
              duration: Number.POSITIVE_INFINITY,
            }),
          );
        }}
      >
        Publish
      </Button>
      <Button
        aria-disabled={publishing === null}
        onClick={() => {
          if (publishing === null) return;
          toast.dismiss(publishing);
          setPublishing(null);
          setStatus("Canceled");
        }}
      >
        Cancel
      </Button>
      <Text variant="body-sm" tone="secondary">
        {status}
      </Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Publish");
  await see("Publishing the card");
  await press("button", "Cancel");
  await see("Canceled");
  await press("button", "Publish");
  await see("Card published");
};
