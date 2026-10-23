import { describe, expect, it } from "vitest";
import {
  formatIdentifier,
  formatPhone,
  identifierKind,
  maskedIdentifier,
  validIdentifier,
} from "./identifier.ts";

/** Types `text` one character at a time at the end, formatting after each, as the field does. */
function typed(text: string): string {
  let value = "";
  for (const character of text) {
    value = formatIdentifier({
      value: value + character,
      caret: value.length + 1,
    }).value;
  }
  return value;
}

describe("identifier", () => {
  it("tells an email from a phone number as it's typed", () => {
    expect(identifierKind("")).toBe("unknown");
    expect(identifierKind("2")).toBe("phone");
    expect(identifierKind("(215) 910")).toBe("phone");
    expect(identifierKind("+44 20")).toBe("phone");
    expect(identifierKind("a")).toBe("email");
    expect(identifierKind("rosa@")).toBe("email");
    expect(identifierKind("--")).toBe("unknown");
  });

  it("formats a North American number as it's typed, and leaves others as written", () => {
    expect(typed("2159105473")).toBe("(215) 910-5473");
    expect(typed("215")).toBe("215");
    expect(typed("2159")).toBe("(215) 9");
    expect(typed("12159105473")).toBe("1 (215) 910-5473");
    expect(typed("+12159105473")).toBe("+1 (215) 910-5473");
    expect(formatPhone("+44 20 7946 0958")).toBe("+44 20 7946 0958");
  });

  it("keeps the caret after the digit it followed when a digit goes in or out in the middle", () => {
    expect(formatIdentifier({ value: "(215) 9105-473", caret: 10 })).toEqual({
      value: "(215) 910-5473",
      caret: 11,
    });
    expect(formatIdentifier({ value: "(25) 910-5473", caret: 2 })).toEqual({
      value: "(259) 105-473",
      caret: 2,
    });
    expect(formatIdentifier({ value: "rosa@cafe.com", caret: 3 })).toEqual({
      value: "rosa@cafe.com",
      caret: 3,
    });
  });

  it("accepts a full email or phone number and nothing less", () => {
    expect(validIdentifier("rosa@cafe.com")).toBe(true);
    expect(validIdentifier("rosa@cafe")).toBe(false);
    expect(validIdentifier("(215) 910-5473")).toBe(true);
    expect(validIdentifier("(215) 910-547")).toBe(false);
    expect(validIdentifier("+44 20 7946 0958")).toBe(true);
    expect(validIdentifier("+44 20")).toBe(false);
    expect(validIdentifier("")).toBe(false);
  });

  it("hides most of where a code went", () => {
    expect(maskedIdentifier("(215) 910-5473")).toBe("••• ••• 5473");
    expect(maskedIdentifier("rosa@cafe.com")).toBe("r•••@cafe.com");
  });
});
