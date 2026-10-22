import { describe, expect, it } from "vitest";
import {
  EMPTY_ADDRESS,
  addressProblems,
  cardDigits,
  cardProblems,
  isClear,
} from "./order-details.ts";

const ADDRESS = {
  email: "ines@example.com",
  name: "Ines Vale",
  street: "2210 SE Ankeny St",
  city: "Portland",
  state: "OR",
  zip: "97214",
};

const CARD = { number: "4111 1111 1111 1111", expiry: "08/28", code: "123" };

describe("addressProblems", () => {
  it("lets a full address through", () => {
    expect(isClear(addressProblems(ADDRESS))).toBe(true);
    expect(isClear(addressProblems({ ...ADDRESS, zip: "97214-1234" }))).toBe(
      true,
    );
  });

  it("asks for every field of an empty form", () => {
    expect(Object.keys(addressProblems(EMPTY_ADDRESS)).sort()).toEqual(
      ["city", "email", "name", "state", "street", "zip"].sort(),
    );
  });

  it("says what's wrong with an email, a state or a ZIP code that doesn't fit", () => {
    expect(
      addressProblems({
        ...ADDRESS,
        email: "ines@example",
        state: "Oregon",
        zip: "972",
      }),
    ).toEqual({
      email: "Enter an email address like name@example.com.",
      state: "Enter the state's two letters, like OR.",
      zip: "Enter a 5-digit ZIP code.",
    });
  });
});

describe("cardProblems", () => {
  it("lets a card through whatever spaces or dashes split its number", () => {
    expect(isClear(cardProblems(CARD))).toBe(true);
    expect(cardDigits("4111-1111 1111-1111")).toBe("4111111111111111");
  });

  it("turns down a short number, a month past 12 and a short code", () => {
    expect(
      cardProblems({ number: "4111 1111", expiry: "13/28", code: "12" }),
    ).toEqual({
      number: "Enter the long number on the front of the card.",
      expiry: "Enter the month and year, like 08/28.",
      code: "Enter the 3 or 4 digits on the card.",
    });
  });

  it("turns down a card that expired before this month, and takes one that expires in it", () => {
    expect(cardProblems({ ...CARD, expiry: "09/26" }).expiry).toBe(
      "This card has expired.",
    );
    expect(cardProblems({ ...CARD, expiry: "10/26" }).expiry).toBeUndefined();
  });
});
