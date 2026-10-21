import { Inline } from "@buttery/core";
import type { DemoSection } from "@buttery/core";
import { InitialsTile } from "@buttery/react";

export const demos: readonly DemoSection[] = [
  {
    title: "Sizes",
    description: "20 and 24 at r6, 32 and 40 at r8.",
    render: () => (
      <Inline gap={3} align="center">
        {(["xs", "sm", "md", "lg"] as const).map((size) => (
          <InitialsTile
            key={size}
            name="Harbor Beans"
            size={size}
            label={`Harbor Beans, ${size}`}
          />
        ))}
      </Inline>
    ),
  },
];
