import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { arrivalsIn, releaseNotes, releaseTitle } from "./release-notes.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

const STEPPERS = {
  version: "0.10.0",
  date: "2026-11-02",
  title: "Steppers",
  summary: "Short flows, one step at a time.",
  examples: [],
  highlights: ["A `Stepper`.", "Button shapes."],
  changes: [
    { packageName: "@butteryui/react", lines: ["Add the Stepper component."] },
  ],
};

describe("release notes for GitHub", () => {
  it("titles a release with its tag and name", () => {
    expect(releaseTitle(STEPPERS)).toBe("v0.10.0: Steppers");
  });

  it("writes what the release is for, its highlights, the components it brought, its changes and a link to its docs", () => {
    expect(
      releaseNotes(STEPPERS, ["Stepper"], "https://example.test/buttery"),
    ).toBe(
      [
        "Short flows, one step at a time.",
        "",
        "- A `Stepper`.",
        "- Button shapes.",
        "",
        "New components: `Stepper`.",
        "",
        "### @butteryui/react",
        "",
        "- Add the Stepper component.",
        "",
        "[The release notes on the docs site](https://example.test/buttery/resources/whats-new#release-0-10-0)",
      ].join("\n"),
    );
  });

  it("finds the components a release brought from their pages' since", () => {
    expect(arrivalsIn(root, "0.4.0")).toContain("Button");
    expect(arrivalsIn(root, "0.4.0")).not.toContain("DataTable");
  });
});
