import { Menu, Stack, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { ArrowLink, SidePanel, TextArea } from "@buttery/react";

export const page: DocsPage = {
  section: "components/overlays",
  title: "SidePanel",
  description:
    "A panel beside the page, such as help, that narrows the page instead of covering it.",
  order: 60,
  status: "new",
  since: "0.7.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Its parts",
    description:
      "Outside a shell it docks where it's placed: its title, a menu, expand and close, a body that scrolls and a pinned footer.",
    render: () => (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          blockSize: "calc(var(--bt-bento-row) * 2)",
        }}
      >
        <SidePanel
          title="Roasting help"
          defaultOpen
          menu={
            <>
              <Menu.Item>Open the roasting guide</Menu.Item>
              <Menu.Item>Contact support</Menu.Item>
              <Menu.Item tone="danger">Clear the conversation</Menu.Item>
            </>
          }
          footer={<TextArea label="Ask a question" rows={2} />}
        >
          <Stack gap={3}>
            <Text variant="title-sm">Popular this week</Text>
            <ArrowLink href="#side-panel">Change a roast profile</ArrowLink>
            <ArrowLink href="#side-panel">Pause a subscription</ArrowLink>
            <ArrowLink href="#side-panel">When payouts arrive</ArrowLink>
          </Stack>
        </SidePanel>
      </div>
    ),
  },
];
