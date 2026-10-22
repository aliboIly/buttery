import type { DemoSection, DocsPage } from "@buttery/core";
import { OptionTiles } from "@buttery/react";

export const page: DocsPage = {
  section: "components/selection",
  title: "OptionTiles",
  description: "Several choices at once, as tiles that take a press anywhere.",
  order: 50,
  status: "new",
  since: "0.7.0",
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
