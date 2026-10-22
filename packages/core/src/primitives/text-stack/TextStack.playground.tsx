import { Surface, TextStack } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";

export const page: DocsPage = {
  section: "foundations",
  title: "TextStack",
  description:
    "A title with body text and a caption under it, spaced by the gaps between trimmed text: for dialogs, empty states and page sections.",
  order: 170,
  status: "stable",
  since: "0.4.5",
  home: "foundations/typography",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Dialog",
    description:
      "A dialog title, the body 16px below and a caption 20px below that, measured between the trimmed text.",
    render: () => (
      <Surface level="dialog" pad={6}>
        <TextStack
          title="Make it yours"
          body="Pick a backdrop, round the corners and add depth. Every change shows up right away."
          caption="Tip: hold Shift for finer steps."
        />
      </Surface>
    ),
  },
  {
    title: "Empty state",
    description: "A title and its description 12px below, centered.",
    render: () => (
      <TextStack
        size="empty"
        align="center"
        title="Your canvas is empty"
        body="Start a fresh card, or open one from your library."
      />
    ),
  },
  {
    title: "Page section",
    description: "A section heading over larger body text.",
    render: () => (
      <TextStack
        size="section"
        title="Every card, one place"
        body="Keep your designs together and pick up where you left off."
      />
    ),
  },
];
