import { ArrowLeftRight, Copy, ImagePlus } from "lucide-react";
import { Icon, Inline, Stack, Text } from "@buttery/core";
import type { DemoSection } from "@buttery/core";

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description:
      "16px inside controls, 20px in empty states; stroke 1.75 at both.",
    render: () => (
      <Inline gap={6}>
        <Stack gap={2} align="center">
          <Icon icon={Copy} />
          <Text variant="caption">sm</Text>
        </Stack>
        <Stack gap={2} align="center">
          <Icon icon={ImagePlus} size="md" />
          <Text variant="caption">md</Text>
        </Stack>
        <Stack gap={2} align="center">
          <Icon icon={ArrowLeftRight} label="Swap hues" />
          <Text variant="caption">labelled</Text>
        </Stack>
      </Inline>
    ),
  },
];
