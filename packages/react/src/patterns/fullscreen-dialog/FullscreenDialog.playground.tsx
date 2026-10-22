import { Icon, Inline, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { Button, Dialog, FullscreenDialog, OptionTiles } from "@buttery/react";
import { Coffee } from "lucide-react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "FullscreenDialog",
  description:
    "A dialog that takes the whole window for one big question and its answer.",
  order: 70,
  status: "new",
  since: "0.7.0",
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
