import { useRef } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Button, toast } from "@butteryui/react";
import type { ToastTone } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Toaster",
  description:
    "Shows short messages from toast() at the bottom of the window, three at most, each leaving on its own after a few seconds; ButteryProvider mounts one, so an app only calls toast().",
  order: 110,
  status: "stable",
  since: "0.4.0",
};

function StackDemo(): ReactElement {
  const exported = useRef(0);
  return (
    <Inline gap={2} wrap>
      <Button
        onClick={() => {
          exported.current += 1;
          toast(`Slide ${String(exported.current)} exported`);
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

function TonesDemo(): ReactElement {
  return (
    <Inline gap={2} wrap>
      <Button
        variant="soft"
        onClick={() => {
          toast("Speaker notes saved");
        }}
      >
        Plain
      </Button>
      <Button
        variant="soft"
        onClick={() => {
          toast.success("Deck published");
        }}
      >
        Success
      </Button>
      <Button
        variant="soft"
        onClick={() => {
          toast.warning("3 slides have no title");
        }}
      >
        Warning
      </Button>
      <Button
        variant="soft"
        onClick={() => {
          toast.danger("Couldn't export the deck", {
            action: {
              label: "Retry",
              onAction: () => undefined,
              altText: "Export again from the Export menu",
            },
          });
        }}
      >
        Danger
      </Button>
    </Inline>
  );
}

const TONES: readonly [ToastTone, ...ToastTone[]] = [
  "neutral",
  "success",
  "warning",
  "danger",
];

function callFor(tone: ToastTone, message: string): string {
  return tone === "neutral"
    ? `toast("${message}")`
    : `toast.${tone}("${message}")`;
}

function LiveToast({
  tone,
  message,
}: {
  readonly tone: ToastTone;
  readonly message: string;
}): ReactElement {
  return (
    <Inline gap={3}>
      <Button
        onClick={() => {
          toast(message, { tone });
        }}
      >
        Show the toast
      </Button>
      <Text variant="body" tone="secondary" truncate>
        {callFor(tone, message)}
      </Text>
    </Inline>
  );
}

export const live: LiveDemo = {
  controls: {
    tone: { kind: "choice", options: TONES, initial: "success" },
    message: { kind: "text", initial: "Deck published" },
  },
  render: ({ tone, message }) => (
    <LiveToast tone={demoChoice(tone, TONES)} message={String(message)} />
  ),
  code: ({ tone, message }) =>
    `<Button onClick={() => ${callFor(demoChoice(tone, TONES), String(message))}}>Show the toast</Button>`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tones",
    description:
      "Plain toasts for news; success, warning and danger tint the pill toward their color and lead with an icon. Warnings and dangers stay 5s.",
    render: () => <TonesDemo />,
  },
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
