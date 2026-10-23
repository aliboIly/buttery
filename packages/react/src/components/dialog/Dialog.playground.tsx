import { Trash2 } from "lucide-react";
import type { ReactElement } from "react";
import { Center, Inline, Surface, Text } from "@butteryui/core";
import { demoChoice } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { gradientCss, gradients } from "@butteryui/core/palettes";
import { Button, Dialog, IconButton } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Dialog",
  description:
    "A modal dialog that dims the page, traps focus and hands it back when it closes.",
  order: 40,
  status: "stable",
  since: "0.7.0",
};

const LILAC = gradients.find((preset) => preset.id === "lilac");

function Confirm(): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">Delete price list</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Text
          title="Delete the holiday price list?"
          body="The 8 cafés on it go back to your standard prices."
        />
        <Dialog.Actions>
          <Dialog.Close asChild>
            <Button variant="soft" size="cta" shape="rounded">
              Keep it
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="primary" size="cta" shape="rounded">
              Delete
            </Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}

function Scene(): ReactElement {
  return (
    <Center
      aria-hidden="true"
      style={{
        aspectRatio: "384 / 200",
        background: LILAC ? gradientCss(LILAC) : undefined,
      }}
    >
      <Surface level="card" padX={6} padY={4}>
        <Text variant="title">Guji, Ethiopia</Text>
      </Surface>
    </Center>
  );
}

function WithMedia(): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">Share</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Media>
          <Scene />
        </Dialog.Media>
        <Dialog.Text
          title="Give a friend 20% off"
          body="They get 20% off their first bag, and you get a bag on us once they order."
          caption="The link works for 30 days."
        />
        <Dialog.Actions>
          <Dialog.Close asChild>
            <Button variant="primary" size="cta" shape="rounded">
              Copy link
            </Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}

function Sized({ size }: { readonly size: "md" | "lg" }): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">{size === "md" ? "Medium" : "Large"}</Button>
      </Dialog.Trigger>
      <Dialog.Content size={size}>
        <Dialog.Text
          title={size === "md" ? "Pick a grind" : "What's new this season"}
          body="Wider dialogs hold a list of choices or copy beside an illustration."
        />
        <Dialog.Actions>
          <Dialog.Close asChild>
            <Button variant="primary" size="cta" shape="rounded">
              Done
            </Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  );
}

const TRIGGERS = ["Button", "IconButton"] as const;

function triggerOf(
  trigger: (typeof TRIGGERS)[number],
  text: string,
): { readonly element: ReactElement; readonly code: string } {
  return trigger === "IconButton"
    ? {
        element: <IconButton icon={Trash2} label={text} />,
        code: `<IconButton icon={Trash2} label="${text}" />`,
      }
    : {
        element: <Button variant="soft">{text}</Button>,
        code: `<Button variant="soft">${text}</Button>`,
      };
}

export const live: LiveDemo = {
  controls: {
    trigger: { kind: "choice", options: TRIGGERS, initial: "Button" },
    triggerText: { kind: "text", initial: "Delete price list" },
  },
  render: ({ trigger, triggerText }) => (
    <Dialog>
      <Dialog.Trigger asChild>
        {triggerOf(demoChoice(trigger, TRIGGERS), String(triggerText)).element}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Text
          title="Delete the holiday price list?"
          body="The 8 cafés on it go back to your standard prices."
        />
        <Dialog.Actions>
          <Dialog.Close asChild>
            <Button variant="soft" size="cta" shape="rounded">
              Keep it
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button variant="primary" size="cta" shape="rounded">
              Delete
            </Button>
          </Dialog.Close>
        </Dialog.Actions>
      </Dialog.Content>
    </Dialog>
  ),
  code: ({ trigger, triggerText }) => `<Dialog>
  <Dialog.Trigger asChild>
    ${triggerOf(demoChoice(trigger, TRIGGERS), String(triggerText)).code}
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Text
      title="Delete the holiday price list?"
      body="The 8 cafés on it go back to your standard prices."
    />
    <Dialog.Actions>
      <Dialog.Close asChild>
        <Button variant="soft" size="cta" shape="rounded">Keep it</Button>
      </Dialog.Close>
      <Dialog.Close asChild>
        <Button variant="primary" size="cta" shape="rounded">Delete</Button>
      </Dialog.Close>
    </Dialog.Actions>
  </Dialog.Content>
</Dialog>`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "Confirm",
    description:
      "Fades in over dur-fast from 97%; Escape, the close button or a press outside closes it, and focus goes back to the trigger.",
    render: () => <Confirm />,
  },
  {
    title: "With media",
    description:
      "The media sits 8px in, its corners 10px inside the dialog's 18px; the close button sits over it.",
    render: () => <WithMedia />,
  },
  {
    title: "Sizes",
    render: () => (
      <Inline gap={2}>
        <Sized size="md" />
        <Sized size="lg" />
      </Inline>
    ),
  },
];
