import { describe, expect, it } from "vitest";
import { migrationsBetween } from "./migrate.ts";
import type { Migration } from "./migrate.ts";

const migration = (version: string): Migration => ({
  version,
  what: `the change ${version} asks for`,
  run: () => [],
});

describe("buttery migrate", () => {
  it("runs the migrations after the installed version, up to the one it moves to", () => {
    const all = ["0.9.0", "0.10.0", "0.11.0", "1.0.0"].map(migration);
    expect(
      migrationsBetween("0.9.2", "0.11.0", all).map(({ version }) => version),
    ).toEqual(["0.10.0", "0.11.0"]);
    expect(migrationsBetween("1.0.0", "1.0.0", all)).toEqual([]);
    expect(migrationsBetween("0.10.0", "0.11.1")).toEqual([]);
  });
});
