import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { KNOWLEDGE_FORMAT, loadKnowledge } from "./knowledge.ts";

let folder = "";

function write(path: string, value: unknown): void {
  mkdirSync(dirname(join(folder, path)), { recursive: true });
  writeFileSync(join(folder, path), JSON.stringify(value));
}

beforeEach(() => {
  folder = mkdtempSync(join(tmpdir(), "buttery-knowledge-"));
  write("server/knowledge.json", {
    format: KNOWLEDGE_FORMAT,
    version: "1.1.0",
  });
});

afterEach(() => {
  rmSync(folder, { recursive: true, force: true });
});

describe("the knowledge the server answers from", () => {
  it("is the copy the project's @butteryui/react ships in its dist, for the version the project has", () => {
    write("app/node_modules/@butteryui/react/package.json", {
      version: "1.0.0",
    });
    write("app/node_modules/@butteryui/react/dist/knowledge.json", {
      format: KNOWLEDGE_FORMAT,
      version: "1.0.0",
    });
    const loaded = loadKnowledge(
      join(folder, "app"),
      join(folder, "server/knowledge.json"),
    );
    expect(loaded.source).toBe("project");
    expect(loaded.knowledge.version).toBe("1.0.0");
    expect(loaded.installed).toBe("1.0.0");
  });

  it("is the server's own copy when the project's @butteryui/react ships none, or one in another format", () => {
    write("app/node_modules/@butteryui/react/package.json", {
      version: "1.0.0",
    });
    const without = loadKnowledge(
      join(folder, "app"),
      join(folder, "server/knowledge.json"),
    );
    expect(without.source).toBe("bundled");
    expect(without.knowledge.version).toBe("1.1.0");
    expect(without.installed).toBe("1.0.0");
    write("app/node_modules/@butteryui/react/dist/knowledge.json", {
      format: KNOWLEDGE_FORMAT + 1,
      version: "1.0.0",
    });
    expect(
      loadKnowledge(join(folder, "app"), join(folder, "server/knowledge.json"))
        .source,
    ).toBe("bundled");
  });

  it("is the server's own copy outside a project", () => {
    const loaded = loadKnowledge(null, join(folder, "server/knowledge.json"));
    expect(loaded.source).toBe("bundled");
    expect(loaded.installed).toBeNull();
  });
});
