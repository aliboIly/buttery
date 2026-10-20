import { useRef } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { Button, toast } from "@buttery/react";

function StackDemo(): ReactElement {
  const exported = useRef(0);
  return (
    <Inline gap={2} wrap>
      <Button
        onClick={() => {
          exported.current += 1;
          toast(`Card ${String(exported.current)} exported`);
        }}
      >
        Show a toast
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          toast.dismiss();
        }}
      >
        Dismiss all
      </Button>
    </Inline>
  );
}

function UploadDemo(): ReactElement {
  return (
    <Inline gap={2} wrap>
      <Button
        onClick={() => {
          toast("Uploading 3 photos", {
            id: "upload",
            duration: Number.POSITIVE_INFINITY,
          });
        }}
      >
        Start the upload
      </Button>
      <Button
        onClick={() => {
          toast("3 photos uploaded", { id: "upload" });
        }}
      >
        Finish it
      </Button>
    </Inline>
  );
}

export const demos: readonly DemoSection[] = [
  {
    title: "Three at most",
    description:
      "Each press adds a toast at the bottom; a fourth lets the oldest go. Hover the toasts and they wait.",
    render: () => <StackDemo />,
  },
  {
    title: "One toast per id",
    description:
      "A toast that stays until it's replaced: finishing swaps it for one that leaves on its own.",
    render: () => <UploadDemo />,
  },
];
