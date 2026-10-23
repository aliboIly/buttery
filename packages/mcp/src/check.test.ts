import { describe, expect, it } from "vitest";
import { CheckRequestError, checkedUrl, merged } from "./check.ts";

describe("buttery_check_layout", () => {
  it("opens pages on this machine and on origins it's told it may", () => {
    expect(checkedUrl("http://localhost:5173/settings", []).href).toBe(
      "http://localhost:5173/settings",
    );
    expect(checkedUrl("http://127.0.0.1:4000/", []).host).toBe(
      "127.0.0.1:4000",
    );
    expect(checkedUrl("http://[::1]:4000/", []).hostname).toBe("[::1]");
    expect(
      checkedUrl("https://staging.example.com/a", [
        "https://staging.example.com",
      ]).href,
    ).toBe("https://staging.example.com/a");
  });

  it("refuses the network, other protocols and text that isn't a URL, saying how to fix it", () => {
    expect(() => checkedUrl("https://example.com/", [])).toThrow(
      CheckRequestError,
    );
    expect(() => checkedUrl("https://example.com/", [])).toThrow(
      /BUTTERY_MCP_ALLOW_URLS/,
    );
    expect(() => checkedUrl("file:///etc/passwd", [])).toThrow(/http address/);
    expect(() => checkedUrl("localhost:5173", [])).toThrow(CheckRequestError);
    expect(() => checkedUrl("settings page", [])).toThrow(/isn't a URL/);
  });

  it("reports a problem once with each condition it showed in, once each", () => {
    const base = {
      rule: "scale",
      a: '[data-bt="Row"]',
      fix: "Use a spacing step.",
      theme: "light",
      density: "comfortable",
      engine: "chromium",
    };
    expect(
      merged([
        { ...base, message: "padding-top is 13px", viewport: "390x844" },
        { ...base, message: "padding-left is 13px", viewport: "390x844" },
        { ...base, message: "padding-top is 13px", viewport: "1280x800" },
        {
          ...base,
          rule: "overflow",
          message: "overflows by 4px",
          viewport: "390x844",
        },
      ]),
    ).toEqual([
      {
        rule: "scale",
        a: '[data-bt="Row"]',
        b: null,
        message: "padding-top is 13px",
        fix: "Use a spacing step.",
        conditions: [
          "390x844 light comfortable chromium",
          "1280x800 light comfortable chromium",
        ],
      },
      {
        rule: "overflow",
        a: '[data-bt="Row"]',
        b: null,
        message: "overflows by 4px",
        fix: "Use a spacing step.",
        conditions: ["390x844 light comfortable chromium"],
      },
    ]);
  });
});
