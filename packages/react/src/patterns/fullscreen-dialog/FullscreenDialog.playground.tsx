import { Icon, Inline, Stack, Text } from "@butteryui/core";
import type {
  DemoSection,
  DemoValues,
  DocsPage,
  LiveDemo,
} from "@butteryui/core";
import {
  Button,
  Dialog,
  FullscreenDialog,
  OptionTiles,
} from "@butteryui/react";
import { Coffee } from "lucide-react";
import type { ReactElement } from "react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "FullscreenDialog",
  description:
    "A dialog that takes the whole window for one big question and its answer.",
  order: 70,
  status: "new",
  since: "0.8.0",
};

const NEEDS = [
  { value: "shop", label: "Sell online" },
  { value: "wholesale", label: "Sell to cafés" },
  { value: "subscriptions", label: "Run subscriptions" },
  { value: "counter", label: "Take payments at the counter" },
];

function headline(title: string, note: string): string {
  return note === "" ? title : `${title} ${note}`;
}

function LiveFullscreenDialog({
  title,
  note,
}: {
  readonly title: string;
  readonly note: string;
}): ReactElement {
  return (
    <Stack gap={2} align="start">
      <FullscreenDialog
        trigger={<Button variant="primary">Set up the roastery</Button>}
        title={title}
        note={note === "" ? undefined : note}
        logo={
          <Inline gap={2}>
            <Icon icon={Coffee} />
            <Text variant="label">Pier Street Roasters</Text>
          </Inline>
        }
        actions={
          <>
            <Dialog.Close asChild>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary">Save</Button>
            </Dialog.Close>
          </>
        }
      >
        <OptionTiles label="What you need" options={NEEDS} />
      </FullscreenDialog>
      <Text variant="caption">{`Asks: ${headline(title, note)}`}</Text>
    </Stack>
  );
}

function fullscreenDialogCode({ title, note }: DemoValues): string {
  return [
    "<FullscreenDialog",
    '  trigger={<Button variant="primary">Set up the roastery</Button>}',
    `  title="${String(title)}"`,
    ...(note === "" ? [] : [`  note="${String(note)}"`]),
    "  logo={",
    "    <Inline gap={2}>",
    "      <Icon icon={Coffee} />",
    '      <Text variant="label">Pier Street Roasters</Text>',
    "    </Inline>",
    "  }",
    "  actions={",
    "    <>",
    "      <Dialog.Close asChild>",
    '        <Button variant="soft">Cancel</Button>',
    "      </Dialog.Close>",
    "      <Dialog.Close asChild>",
    '        <Button variant="primary" onClick={save}>Save</Button>',
    "      </Dialog.Close>",
    "    </>",
    "  }",
    ">",
    '  <OptionTiles label="What you need" options={needs} value={chosen} onValueChange={setChosen} />',
    "</FullscreenDialog>",
  ].join("\n");
}

export const live: LiveDemo = {
  controls: {
    title: { kind: "text", initial: "What do you need to get started?" },
    note: { kind: "text", initial: "You can change this later." },
  },
  render: ({ title, note }) => (
    <LiveFullscreenDialog title={String(title)} note={String(note)} />
  ),
  code: fullscreenDialogCode,
};

export const demos: readonly DemoSection[] = [
  {
    title: "A setup question",
    description: "A strong question and a quieter note, then tiles to answer.",
    render: () => (
      <FullscreenDialog
        trigger={<Button variant="primary">Set up the roastery</Button>}
        title="What do you need to get started?"
        note="You can change this later."
        logo={
          <Inline gap={2}>
            <Icon icon={Coffee} />
            <Text variant="label">Pier Street Roasters</Text>
          </Inline>
        }
        actions={
          <>
            <Dialog.Close asChild>
              <Button variant="soft">Cancel</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary">Save</Button>
            </Dialog.Close>
          </>
        }
      >
        <OptionTiles
          label="What you need"
          options={[
            { value: "shop", label: "Sell online" },
            { value: "wholesale", label: "Sell to cafés" },
            { value: "subscriptions", label: "Run subscriptions" },
            { value: "counter", label: "Take payments at the counter" },
          ]}
        />
      </FullscreenDialog>
    ),
  },
];
