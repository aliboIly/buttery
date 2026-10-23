import { describe, expect, it } from "vitest";
import { minorOf, releaseDate, releaseId } from "./release.ts";

describe("release helpers", () => {
  it("names a release's heading after its number", () => {
    expect(releaseId("0.9.0")).toBe("release-0-9-0");
  });

  it("finds a version's minor release", () => {
    expect(minorOf("0.9.0")).toBe("0.9");
    expect(minorOf("1.10.2")).toBe("1.10");
  });

  it("writes a release's date out in full, whatever the time zone", () => {
    expect(releaseDate("2026-10-22")).toBe("October 22, 2026");
    expect(releaseDate("2027-01-01")).toBe("January 1, 2027");
  });

  it("keeps a date it can't read as it is", () => {
    expect(releaseDate("soon")).toBe("soon");
  });
});
