import { demoChoice, Stack } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { ArrowLink, Callout } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/feedback",
  title: "Callout",
  description:
    "A tinted box for a message in place: information, success, a warning or an error.",
  order: 20,
  status: "stable",
  since: "0.5.0",
};

export const live: LiveDemo = {
  controls: {
    tone: {
      kind: "choice",
      options: ["info", "success", "warning", "danger"],
      initial: "info",
    },
    variant: {
      kind: "choice",
      options: ["soft", "outline", "accent"],
      initial: "soft",
    },
    title: { kind: "text", initial: "Wholesale prices stay in sync" },
    children: {
      kind: "text",
      initial: "A change here shows up on every café's order form.",
    },
  },
  render: ({ tone, variant, title, children }) => (
    <Callout
      tone={demoChoice(tone, ["info", "success", "warning", "danger"])}
      variant={demoChoice(variant, ["soft", "outline", "accent"])}
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
        <Callout title="Wholesale prices stay in sync">
          A change here shows up on every café's order form.
        </Callout>
        <Callout tone="success" title="Orders exported">
          The CSV file is in your downloads.
        </Callout>
        <Callout
          tone="warning"
          title="Large export"
          action={<ArrowLink href="#/callout">Pick a shorter range</ArrowLink>}
        >
          Two years of orders makes a file over 20 MB.
        </Callout>
        <Callout tone="danger" title="Couldn't sign in">
          Check your email and password, then try again.
        </Callout>
      </Stack>
    ),
  },
  {
    title: "Variants",
    description:
      "Soft fills with the tone's tint, outline draws a 1px edge in the tone's color on the surface, and accent adds a 4px bar of it along the start edge.",
    render: () => (
      <Stack gap={3}>
        <Callout title="Roast dates print on every bag">
          Customers see the day their coffee was roasted.
        </Callout>
        <Callout variant="outline" tone="danger" title="Card declined">
          The bank turned down the payment. Ask the café for another card.
        </Callout>
        <Callout
          variant="accent"
          tone="success"
          title="Price list sent"
          action={<ArrowLink href="#/callout">See who opened it</ArrowLink>}
        >
          Twelve cafés have the new wholesale prices.
        </Callout>
        <Callout variant="accent" tone="warning" title="Low on green coffee">
          Two roasts left before the next delivery.
        </Callout>
      </Stack>
    ),
  },
];
