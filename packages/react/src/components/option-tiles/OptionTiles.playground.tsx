import { demoChoice } from "@buttery/core";
import type { DemoSection, DocsPage, LiveDemo } from "@buttery/core";
import { OptionTiles } from "@buttery/react";
import type { OptionTile } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "OptionTiles",
  description: "Several choices at once, as tiles that take a press anywhere.",
  order: 50,
  status: "new",
  since: "0.7.0",
};

const SETS = ["words only", "with lines", "one disabled"] as const;

const TILES: Readonly<Record<(typeof SETS)[number], readonly OptionTile[]>> = {
  "words only": [
    { value: "shop", label: "Sell online" },
    { value: "wholesale", label: "Sell to cafés" },
    { value: "subscriptions", label: "Run subscriptions" },
    { value: "counter", label: "Take payments at the counter" },
  ],
  "with lines": [
    { value: "mon", label: "Monday", description: "Espresso blends" },
    { value: "tue", label: "Tuesday", description: "Single origins" },
    { value: "thu", label: "Thursday", description: "Decaf and cold brew" },
  ],
  "one disabled": [
    { value: "mon", label: "Monday", description: "Espresso blends" },
    { value: "thu", label: "Thursday", description: "Decaf and cold brew" },
    {
      value: "sun",
      label: "Sunday",
      description: "The roastery is closed",
      disabled: true,
    },
  ],
};

function codeOf(tile: OptionTile): string {
  const parts = [`value: "${tile.value}"`, `label: "${tile.label}"`];
  if (tile.description !== undefined)
    parts.push(`description: "${tile.description}"`);
  if (tile.disabled === true) parts.push("disabled: true");
  return `    { ${parts.join(", ")} },`;
}

export const live: LiveDemo = {
  controls: {
    label: { kind: "text", initial: "What you need" },
    options: { kind: "choice", options: SETS, initial: "words only" },
  },
  render: ({ label, options }) => (
    <OptionTiles
      label={String(label)}
      options={TILES[demoChoice(options, SETS)]}
    />
  ),
  code: ({ label, options }) => `<OptionTiles
  label="${String(label)}"
  options={[
${TILES[demoChoice(options, SETS)].map(codeOf).join("\n")}
  ]}
/>`,
};

export const demos: readonly DemoSection[] = [
  {
    title: "What a roastery needs",
    description: "Two columns from 480px of room, one under it.",
    render: () => (
      <OptionTiles
        label="What you need"
        defaultValue={["shop"]}
        options={[
          { value: "shop", label: "Sell online" },
          { value: "wholesale", label: "Sell to cafés" },
          { value: "subscriptions", label: "Run subscriptions" },
          { value: "counter", label: "Take payments at the counter" },
        ]}
      />
    ),
  },
  {
    title: "With lines and a closed day",
    render: () => (
      <OptionTiles
        label="Roast days"
        defaultValue={["mon", "thu"]}
        options={[
          { value: "mon", label: "Monday", description: "Espresso blends" },
          { value: "tue", label: "Tuesday", description: "Single origins" },
          {
            value: "thu",
            label: "Thursday",
            description: "Decaf and cold brew",
          },
          {
            value: "sun",
            label: "Sunday",
            description: "The roastery is closed",
            disabled: true,
          },
        ]}
      />
    ),
  },
];
