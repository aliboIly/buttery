import { demoChoice, Stack } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { ArrowLink, Callout } from "@buttery/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Callout",
  description:
    "A tinted box for a message in place: information, success, a warning or an error.",
  order: 20,
  status: "stable",
  since: "0.4.5",
};

export const live: LiveDemo = {
  controls: {
    tone: {
      kind: "choice",
      options: ["info", "success", "warning", "danger"],
      initial: "info",
    },
    title: { kind: "text", initial: "Shared cards stay in sync" },
    children: {
      kind: "text",
      initial: "Changes you make show up for everyone you've shared with.",
    },
  },
  render: ({ tone, title, children }) => (
    <Callout
      tone={demoChoice(tone, ["info", "success", "warning", "danger"])}
      title={String(title)}
    >
      {String(children)}
    </Callout>
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Tones",
    description:
      "Info, success, warning and danger, each with its icon and tint.",
    render: () => (
      <Stack gap={3}>
        <Callout title="Shared cards stay in sync">
          Changes you make show up for everyone you've shared with.
        </Callout>
        <Callout tone="success" title="Card exported">
          It's in your downloads as a PNG.
        </Callout>
        <Callout
          tone="warning"
          title="Large export"
          action={<ArrowLink href="#/callout">Pick a smaller size</ArrowLink>}
        >
          At this size the file will be over 20 MB.
        </Callout>
        <Callout tone="danger" title="Couldn't sign in">
          Check your email and password, then try again.
        </Callout>
      </Stack>
    ),
  },
];
