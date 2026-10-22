import { Inline, Stack, Surface, Text } from "@buttery/core";
import type { DemoSection, DocsPage } from "@buttery/core";
import { BrandMark } from "@buttery/react";

export const page: DocsPage = {
  section: "resources",
  title: "Brand",
  description:
    "buttery's mark, a soft pat of butter, and where the 🧈 character goes instead.",
  order: 30,
  status: "new",
  since: "0.8.0",
};

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description:
      "16, 24, 32, 64, 128 and 512px. At 16 it's three flat faces, which read at favicon size.",
    render: () => (
      <Inline gap={6} align="end" wrap>
        {([16, 24, 32, 64, 128] as const).map((size) => (
          <BrandMark key={size} size={size} />
        ))}
      </Inline>
    ),
  },
  {
    title: "On light and dark",
    description:
      "The same colors in both themes: the cream top, the butter front, the deeper side.",
    render: () => (
      <Inline gap={4} wrap>
        {(["light", "dark"] as const).map((theme) => (
          <Surface key={theme} level="card" pad={5} data-bt-theme={theme}>
            <Stack gap={3} align="center">
              <BrandMark size={64} />
              <Text variant="caption" tone="secondary">
                {theme === "light" ? "Light" : "Dark"}
              </Text>
            </Stack>
          </Surface>
        ))}
      </Inline>
    ),
  },
];
