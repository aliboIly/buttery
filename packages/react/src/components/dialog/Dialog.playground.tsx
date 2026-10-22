import type { ReactElement } from "react";
import { Center, Inline, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { gradientCss, gradients } from "@buttery/core/palettes";
import { Button, Dialog } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "Dialog",
  description:
    "A modal dialog that dims the page, traps focus and hands it back when it closes.",
  order: 40,
  status: "stable",
  since: "0.6.0",
};

const LILAC = gradients.find((preset) => preset.id === "lilac");

function Confirm(): ReactElement {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="soft">Delete card</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Text
          title="Delete this card?"
          body="It stays in the trash for 30 days, then it's gone for good."
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
        <Text variant="title">Launch card</Text>
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
          title="Share your card"
          body="Anyone with the link can see it, but only you can change it."
          caption="Links stay on until you turn them off."
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
          title={
            size === "md" ? "Pick a starting point" : "What's in this release"
          }
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
