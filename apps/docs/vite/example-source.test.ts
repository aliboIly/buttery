import { describe, expect, it } from "vitest";
import { shownSource } from "./example-source.ts";

const EXAMPLE = `import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { Button } from "@buttery/react";

/** One action and what it changes. */
export function AddToOrder(): ReactElement {
  const [bags, setBags] = useState(0);
  return (
    <Inline gap={3}>
      <Button onClick={() => { setBags(bags + 1); }}>Add a bag</Button>
      <Text variant="body">{String(bags)}</Text>
    </Inline>
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "Add a bag");
  await see("1");
};
`;

describe("shownSource", () => {
  it("leaves out the kind and play exports and the types only they need", () => {
    const shown = shownSource(EXAMPLE);
    expect(shown).not.toContain("ExampleKind");
    expect(shown).not.toContain("ExamplePlay");
    expect(shown).not.toContain("export const play");
    expect(shown).toContain('import { Inline, Text } from "@buttery/core";');
    expect(shown.endsWith("}\n")).toBe(true);
    expect(shown).not.toMatch(/\n{3}/);
  });

  it("keeps the other types an import names beside them", () => {
    const shown = shownSource(
      EXAMPLE.replace(
        "import type { ExampleKind, ExamplePlay }",
        "import type { ExampleKind, ExamplePlay, SpaceStep }",
      ),
    );
    expect(shown).toContain('import type { SpaceStep } from "@buttery/core";');
  });

  it("leaves an example without them as it is", () => {
    const plain = `import type { ReactElement } from "react";

/** A plain example. */
export function Plain(): ReactElement {
  return <p>Plain</p>;
}
`;
    expect(shownSource(plain)).toBe(plain);
  });

  it("leaves out a play whose parameters prettier broke over lines", () => {
    const shown = shownSource(
      EXAMPLE.replace(
        "async ({ press, see }) => {",
        "async ({\n  press,\n  see,\n}) => {",
      ),
    );
    expect(shown).not.toContain("press,");
    expect(shown).not.toContain("await");
  });
});
