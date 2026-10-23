import { useState } from "react";
import type { ReactElement } from "react";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button, DropZone, EmptyState } from "@buttery/react";

export const page: DocsPage = {
  section: "components/inputs",
  title: "DropZone",
  description:
    "An area that takes files dropped on it, pasted or opened with a shortcut, and says so while a file is held over it.",
  order: 40,
  status: "stable",
  since: "0.6.0",
};

function ImageDrop({
  accept = "image/*",
  multiple = false,
  disabled = false,
}: {
  readonly accept?: string;
  readonly multiple?: boolean;
  readonly disabled?: boolean;
}): ReactElement {
  const [names, setNames] = useState<readonly string[]>([]);
  return (
    <DropZone
      accept={accept}
      multiple={multiple}
      disabled={disabled}
      onFiles={(files) => {
        setNames(files.map((file) => file.name));
      }}
      style={{ blockSize: "var(--bt-bento-row)" }}
    >
      <EmptyState
        title={names.length === 0 ? "Add a background" : names.join(", ")}
        description="Drag a picture onto the slide, paste it from your clipboard, or open one with ⌘O."
        actions={
          <DropZone.Open>
            <Button variant="primary">Pick a picture</Button>
          </DropZone.Open>
        }
      />
    </DropZone>
  );
}

export const live: LiveDemo = {
  controls: {
    accept: {
      kind: "choice",
      options: ["image/*", ".png,.jpg", "application/pdf,image/*"],
      initial: "image/*",
    },
    multiple: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
  },
  render: ({ accept, multiple, disabled }) => (
    <ImageDrop
      accept={demoChoice(accept, [
        "image/*",
        ".png,.jpg",
        "application/pdf,image/*",
      ])}
      multiple={multiple === true}
      disabled={disabled === true}
    />
  ),
  code: ({ accept, multiple, disabled }) =>
    [
      "<DropZone",
      `  accept="${String(accept)}"`,
      ...(multiple === true ? ["  multiple"] : []),
      ...(disabled === true ? ["  disabled"] : []),
      "  onFiles={(files) => setNames(files.map((file) => file.name))}",
      ">",
      "  <EmptyState",
      '    title="Add a background"',
      '    description="Drag a picture onto the slide, paste it from your clipboard, or open one with ⌘O."',
      '    actions={<DropZone.Open><Button variant="primary">Pick a picture</Button></DropZone.Open>}',
      "  />",
      "</DropZone>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Picture drop",
    description:
      "Hold a file over it to see the tint and dashed edge; only images reach onFiles.",
    render: () => <ImageDrop />,
  },
];
