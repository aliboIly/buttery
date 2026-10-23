import type { ReactElement } from "react";
import { demoChoice, Inline } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { Avatar } from "@butteryui/react";

export const page: DocsPage = {
  section: "components/data-display",
  title: "Avatar",
  description:
    "A person's round picture, or their initials when there's none or it fails to load.",
  order: 20,
  status: "new",
  since: "0.8.0",
};

const PORTRAIT = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#dbe7f7"/><circle cx="20" cy="16" r="7" fill="#2862e0"/><path d="M6 40c2-9 8-13 14-13s12 4 14 13z" fill="#2862e0"/></svg>',
)}`;

function Sizes({ src }: { readonly src?: string }): ReactElement {
  return (
    <Inline gap={3} align="center">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <Avatar
          key={size}
          name="Tomas Reyes"
          size={size}
          label={`Tomas Reyes, ${size}`}
          {...(src === undefined ? {} : { src })}
        />
      ))}
    </Inline>
  );
}

export const live: LiveDemo = {
  controls: {
    size: { kind: "choice", options: ["xs", "sm", "md", "lg"], initial: "sm" },
    name: { kind: "text", initial: "Mira Okafor" },
  },
  render: ({ size, name }) => (
    <Avatar
      name={String(name)}
      size={demoChoice(size, ["sm", "xs", "md", "lg"])}
    />
  ),
};

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description: "20, 24, 32 and 40, with a picture and with initials.",
    render: () => (
      <Inline gap={6} align="center" wrap>
        <Sizes src={PORTRAIT} />
        <Sizes />
      </Inline>
    ),
  },
  {
    title: "A picture that fails",
    description:
      "The initials stay when the picture can't load, at the same size.",
    render: () => (
      <Avatar
        name="Ines Vale"
        label="Ines Vale"
        size="lg"
        src="data:image/png;base64,AAAA"
      />
    ),
  },
];
