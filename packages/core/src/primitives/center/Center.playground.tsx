import { Center, Surface, Text } from "@butteryui/core";
import type { DemoSection, DocsPage } from "@butteryui/core";

export const page: DocsPage = {
  section: "layout",
  title: "Center",
  description:
    "Centers its content on both axes and fills the space it's given.",
  order: 110,
  status: "stable",
  since: "0.2.0",
  home: "layout/page-grid-and-containers",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Both axes",
    description: "Content sits in the middle of whatever space Center gets.",
    render: () => (
      <Surface level="section" pad={12}>
        <Center>
          <Surface level="raised" padX={3} padY={2}>
            <Text variant="label">Centered</Text>
          </Surface>
        </Center>
      </Surface>
    ),
  },
];
