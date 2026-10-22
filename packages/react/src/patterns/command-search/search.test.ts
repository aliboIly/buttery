import { describe, expect, it } from "vitest";
import {
  formatSearch,
  matchRanges,
  matchesSearch,
  pageSource,
  parseSearch,
} from "./search.ts";
import type { SearchFilter } from "./search.ts";

const FILTERS: readonly SearchFilter[] = [
  {
    key: "status",
    example: "shipped",
    description: "where an order has got to",
  },
  { key: "city", example: "Portland", description: "where a customer is" },
];

describe("parseSearch", () => {
  it("takes a known key:value as a filter once a space follows it", () => {
    expect(parseSearch("status:shipped decaf", FILTERS)).toEqual({
      text: "decaf",
      filters: [{ key: "status", value: "shipped" }],
    });
    expect(parseSearch("decaf status:shipped", FILTERS)).toEqual({
      text: "decaf status:shipped",
      filters: [],
    });
  });

  it("leaves an unknown key in the words, and matches a key whatever its case", () => {
    expect(parseSearch("Status:paid size:large ", FILTERS)).toEqual({
      text: "size:large ",
      filters: [{ key: "status", value: "paid" }],
    });
  });

  it("finishes the last filter too when the search was sent, without a trailing space", () => {
    expect(
      parseSearch("decaf status:shipped", FILTERS, { sent: true }),
    ).toEqual({
      text: "decaf",
      filters: [{ key: "status", value: "shipped" }],
    });
    expect(parseSearch("ines ", FILTERS, { sent: true })).toEqual({
      text: "ines",
      filters: [],
    });
  });

  it("reads back what formatSearch writes", () => {
    const query = {
      text: "decaf",
      filters: [
        { key: "status", value: "shipped" },
        { key: "city", value: "Portland" },
      ],
    };
    expect(parseSearch(formatSearch(query), FILTERS)).toEqual(query);
  });
});

describe("matching", () => {
  it("needs every word somewhere in the fields, ignoring case", () => {
    expect(matchesSearch("team not", "Team notifications", "Settings")).toBe(
      true,
    );
    expect(matchesSearch("team pay", "Team notifications")).toBe(false);
    expect(matchesSearch("  ", "Anything")).toBe(false);
  });

  it("marks each word where it appears, merging ranges that touch", () => {
    expect(matchRanges("Risk controls", "is")).toEqual([[1, 3]]);
    expect(matchRanges("Shipping", "ship pin")).toEqual([[0, 7]]);
  });
});

describe("pageSource", () => {
  it("gives each page its own id, even when pages share an href", () => {
    const pages = pageSource({
      pages: [
        { label: "Shop settings", href: "#same" },
        { label: "Shipping", href: "#same" },
      ],
    });
    const found = pages.search({ text: "sh", filters: [] });
    expect(new Set(found.map((item) => item.id)).size).toBe(2);
  });

  it("finds nothing while the search has filters", () => {
    const pages = pageSource({ pages: [{ label: "Orders", href: "#orders" }] });
    expect(
      pages.search({
        text: "orders",
        filters: [{ key: "status", value: "paid" }],
      }),
    ).toEqual([]);
  });
});
