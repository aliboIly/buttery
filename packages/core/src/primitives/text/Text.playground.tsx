import { displayRoles, Stack, Surface, Text, textRoles } from "@butteryui/core";
import type {
  DemoSection,
  DocsPage,
  TextTone,
  TextVariant,
} from "@butteryui/core";

export const page: DocsPage = {
  section: "foundations",
  title: "Text",
  description:
    "Text in one of buttery's type roles, with size, line height, weight, tracking and color from the tokens.",
  order: 160,
  status: "stable",
  since: "0.2.0",
  home: "foundations/typography",
};

const ROLES = [
  ...Object.keys(textRoles),
  ...Object.keys(displayRoles),
] as TextVariant[];
const TONES: readonly TextTone[] = [
  "strong",
  "default",
  "secondary",
  "tertiary",
  "disabled",
];

export const demos: readonly DemoSection[] = [
  {
    title: "Roles",
    description:
      "Every role on the type scale; display roles scale with their container.",
    render: () => (
      <Stack gap={4}>
        {ROLES.map((role) => (
          <Stack key={role} gap={3}>
            <Text variant="caption">{role}</Text>
            <Text variant={role}>Pick a theme for every slide</Text>
          </Stack>
        ))}
      </Stack>
    ),
  },
  {
    title: "Tones",
    render: () => (
      <Stack gap={2} align="start">
        {TONES.filter((tone) => tone !== "disabled").map((tone) => (
          <Text key={tone} tone={tone}>
            {tone}
          </Text>
        ))}
        <button type="button" disabled>
          <Text tone="disabled">disabled (only inside disabled controls)</Text>
        </button>
      </Stack>
    ),
  },
  {
    title: "Truncation",
    description: "One line with an ellipsis; the full text is in the title.",
    render: () => (
      <Surface level="card" padX={4} padY={3}>
        <Text truncate>
          A label far longer than the row it has to fit inside, so it truncates
        </Text>
      </Surface>
    ),
  },
];
