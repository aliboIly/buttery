import { Download, Plus } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Inline } from "@buttery/core";
import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { Button } from "@buttery/react";
import type { ButtonVariant } from "@buttery/react";

export const page: DocsPage = {
  section: "components/actions",
  title: "Button",
  description:
    "A button for actions: four variants, three sizes, a loading state, icons and a navigation arrow.",
  order: 20,
  status: "stable",
  since: "0.4.0",
};

const VARIANTS: readonly ButtonVariant[] = [
  "primary",
  "soft",
  "secondary",
  "ghost",
];

function LoadingDemo(): ReactElement {
  const [loading, setLoading] = useState(false);
  return (
    <Inline gap={2} wrap>
      <Button
        variant="primary"
        loading={loading}
        onClick={() => {
          setLoading(true);
        }}
      >
        Export the card
      </Button>
      <Button
        onClick={() => {
          setLoading(false);
        }}
      >
        Stop
      </Button>
    </Inline>
  );
}

export const live: LiveDemo = {
  controls: {
    variant: {
      kind: "choice",
      options: ["primary", "secondary", "soft", "ghost"],
      initial: "primary",
    },
    size: { kind: "choice", options: ["sm", "md", "cta"], initial: "md" },
    shape: { kind: "choice", options: ["pill", "rounded"], initial: "pill" },
    loading: { kind: "toggle", initial: false },
    disabled: { kind: "toggle", initial: false },
    children: { kind: "text", initial: "Save changes" },
  },
  render: ({ variant, size, shape, loading, disabled, children }) => (
    <Button
      variant={demoChoice(variant, ["primary", "secondary", "soft", "ghost"])}
      size={demoChoice(size, ["md", "sm", "cta"])}
      shape={demoChoice(shape, ["pill", "rounded"])}
      loading={loading === true}
      disabled={disabled === true}
    >
      {String(children)}
    </Button>
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Variants",
    description:
      "Primary for the one main action in view, soft for the rest, secondary on tinted surfaces, ghost for quiet actions.",
    render: () => (
      <Inline gap={2} wrap>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </Inline>
    ),
  },
  {
    title: "Sizes and shapes",
    description: "28, 36 and 48px tall; rounded corners for dialog steps.",
    render: () => (
      <Inline gap={2} wrap align="center">
        <Button size="sm">Small</Button>
        <Button>Medium</Button>
        <Button size="cta" variant="primary">
          Call to action
        </Button>
        <Button size="cta" shape="rounded" variant="primary">
          Rounded
        </Button>
      </Inline>
    ),
  },
  {
    title: "Arrows",
    description:
      "Forward and back steps. Hover or focus one: the chevron grows a stem and the button keeps its width.",
    render: () => (
      <Inline gap={2} wrap>
        <Button arrow="back">Back</Button>
        <Button variant="primary" arrow="forward">
          Next
        </Button>
        <Button variant="primary" size="cta" arrow="forward">
          Get started
        </Button>
        <Button variant="ghost" arrow="forward">
          Learn more
        </Button>
      </Inline>
    ),
  },
  {
    title: "Icons",
    render: () => (
      <Inline gap={2} wrap>
        <Button iconStart={Plus}>New card</Button>
        <Button variant="primary" iconStart={Download}>
          Download
        </Button>
      </Inline>
    ),
  },
  {
    title: "With a shortcut",
    description:
      "The key that does the same thing, after the label in the button's own color. Bind it with useShortcut.",
    render: () => (
      <Inline gap={2} align="center">
        <Button variant="primary" iconStart={Plus} shortcut="n">
          New order
        </Button>
        <Button shortcut="mod+e">Export</Button>
      </Inline>
    ),
  },
  {
    title: "Loading",
    description:
      "A spinner over the label; the button keeps its size and ignores presses.",
    render: () => <LoadingDemo />,
  },
  {
    title: "Disabled",
    render: () => (
      <Inline gap={2} wrap>
        {VARIANTS.map((variant) => (
          <Button key={variant} variant={variant} disabled>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        ))}
      </Inline>
    ),
  },
  {
    title: "As a link",
    render: () => (
      <Button asChild variant="primary" arrow="forward">
        <a href="#/arrow-link">Read about arrows</a>
      </Button>
    ),
  },
];
