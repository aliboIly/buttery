import { beforeAll, describe, expect, it } from "vitest";
import { repoKnowledge } from "../scripts/fixture.ts";
import type { Knowledge } from "./knowledge.ts";
import { checkProps } from "./props-check.ts";

let knowledge: Knowledge;

beforeAll(() => {
  knowledge = repoKnowledge();
});

const IMPORTS = `import { Stack, Surface, Text } from "@butteryui/core";
import { Button } from "@butteryui/react";
`;

describe("checkProps", () => {
  it("flags a literal a prop's type doesn't allow, with the values it takes", () => {
    const found = checkProps(
      knowledge,
      `${IMPORTS}export const A = () => (
  <Stack gap="16px">
    <Surface level="card" radius="huge">
      <Text variant="title-xl">Hi</Text>
      <Button variant="primay">Go</Button>
    </Surface>
  </Stack>
);`,
      "src/A.tsx",
    );
    expect(
      found.map(({ line, column, message }) => ({ line, column, message })),
    ).toEqual([
      { line: 4, column: 10, message: `Stack's gap doesn't take "16px".` },
      { line: 5, column: 27, message: `Surface's radius doesn't take "huge".` },
      {
        line: 6,
        column: 13,
        message: `Text's variant doesn't take "title-xl".`,
      },
      {
        line: 7,
        column: 15,
        message: `Button's variant doesn't take "primay".`,
      },
    ]);
    expect(found[0]?.fix).toBe("Write gap={4}: spacing step 4 is 16px.");
    expect(found[3]?.fix).toBe(
      `Use one of "primary" | "secondary" | "soft" | "ghost".`,
    );
    expect(
      found.every(
        ({ rule, file }) =>
          rule === "buttery/prop-values" && file === "src/A.tsx",
      ),
    ).toBe(true);
  });

  it("takes a spacing step as a number or a string, and leaves expressions alone", () => {
    expect(
      checkProps(
        knowledge,
        `${IMPORTS}export const A = ({ size }: { size: "sm" }) => (
  <Stack gap={4} padX="2" pad={size === "sm" ? 2 : 4}>
    <Button variant={"primary"} size={size} onClick={() => go({ a: 1 })}>Go</Button>
  </Stack>
);`,
        "src/A.tsx",
      ),
    ).toEqual([]);
  });

  it("only checks components the file imports from buttery", () => {
    expect(
      checkProps(
        knowledge,
        `export const A = () => <Stack gap="16px" />;`,
        "src/A.tsx",
      ),
    ).toEqual([]);
  });
});
