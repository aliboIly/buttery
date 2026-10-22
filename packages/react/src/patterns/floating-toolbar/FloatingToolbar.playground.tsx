import { useRef, useState } from "react";
import type { ReactElement } from "react";
import { Center, Inline, Stack, Surface, Text } from "@buttery/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@buttery/core";
import { Button, FloatingToolbar } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "FloatingToolbar",
  description:
    "A floating pill of actions anchored under an element, such as crop mode's size, Reset, Cancel and Apply.",
  order: 40,
  status: "stable",
  since: "0.5.0",
};

function CropDemo(): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const [cropping, setCropping] = useState(true);
  return (
    <Stack gap={16}>
      <Inline>
        <Button
          onClick={() => {
            setCropping((on) => !on);
          }}
        >
          {cropping ? "Stop resizing" : "Resize"}
        </Button>
      </Inline>
      <Center>
        <Surface ref={frame} level="card" padX={10} padY={8}>
          <Text variant="title">Launch card</Text>
        </Surface>
      </Center>
      <FloatingToolbar
        anchor={frame}
        label="Canvas size"
        meta="1920 × 1080"
        open={cropping}
        delayed
      >
        <FloatingToolbar.Button variant="ghost" aria-disabled>
          Revert
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          onClick={() => {
            setCropping(false);
          }}
        >
          Discard
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          variant="primary"
          onClick={() => {
            setCropping(false);
          }}
        >
          Keep size
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Stack>
  );
}

function LiveToolbar({
  open,
  meta,
}: {
  readonly open: boolean;
  readonly meta: string;
}): ReactElement {
  const frame = useRef<HTMLDivElement>(null);
  const [showing, setShowing] = useState(open);
  const [size, setSize] = useState("1600 × 900");
  return (
    <Center>
      <Surface ref={frame} level="card" padX={10} padY={8}>
        <Stack gap={2}>
          <Text variant="title">Launch card</Text>
          <Text variant="caption">
            {showing && meta !== "" ? `Resizing to ${meta}` : `Canvas ${size}`}
          </Text>
        </Stack>
      </Surface>
      <FloatingToolbar
        anchor={frame}
        label="Canvas size"
        meta={meta === "" ? undefined : meta}
        open={showing}
      >
        <FloatingToolbar.Button variant="ghost" aria-disabled>
          Revert
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          onClick={() => {
            setShowing(false);
          }}
        >
          Discard
        </FloatingToolbar.Button>
        <FloatingToolbar.Button
          variant="primary"
          onClick={() => {
            setSize(meta === "" ? size : meta);
            setShowing(false);
          }}
        >
          Keep size
        </FloatingToolbar.Button>
      </FloatingToolbar>
    </Center>
  );
}

function toolbarCode({ open, meta }: DemoValues): string {
  const props = [
    "anchor={frame}",
    'label="Canvas size"',
    ...(meta === "" ? [] : [`meta="${String(meta)}"`]),
    ...(open === true ? [] : ["open={false}"]),
  ];
  return [
    `<FloatingToolbar ${props.join(" ")}>`,
    '  <FloatingToolbar.Button variant="ghost" aria-disabled>',
    "    Revert",
    "  </FloatingToolbar.Button>",
    "  <FloatingToolbar.Button onClick={discard}>Discard</FloatingToolbar.Button>",
    '  <FloatingToolbar.Button variant="primary" onClick={keep}>',
    "    Keep size",
    "  </FloatingToolbar.Button>",
    "</FloatingToolbar>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    meta: { kind: "text", initial: "1920 × 1080" },
    open: { kind: "toggle", initial: true },
  },
  render: ({ open, meta }) => (
    <LiveToolbar key={String(open)} open={open === true} meta={String(meta)} />
  ),
  code: toolbarCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Resize mode",
    description:
      "12px under the card, centered and kept inside the viewport; it rises in a beat after resize mode starts and follows the card as the page scrolls.",
    render: () => <CropDemo />,
  },
];
