/** What an identifier field holds: an email address, a phone number, or too little to tell. */
export type IdentifierKind = "email" | "phone" | "unknown";

/** A value and where its caret sits, so formatting can keep the caret beside the same digit. */
export interface Edited {
  /** The text. */
  readonly value: string;
  /** Where the caret sits in it, as a count of characters before it. */
  readonly caret: number;
}

const PHONE_CHARACTERS = /^\+?[\d\s().-]*$/;
const EMAIL = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;

/** What `value` looks like so far: a letter or an `@` makes it an email, digits and phone marks a phone. */
export function identifierKind(value: string): IdentifierKind {
  const text = value.trim();
  if (text === "") return "unknown";
  if (/[@a-z]/i.test(text)) return "email";
  return PHONE_CHARACTERS.test(text) && /\d/.test(text) ? "phone" : "unknown";
}

function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

/** Whether `value`, as written, is a North American number: no `+`, or `+1`, and at most 11 digits. */
function northAmerican(value: string): boolean {
  const text = value.trim();
  const digits = digitsOf(text);
  if (text.startsWith("+")) return text.startsWith("+1") && digits.length <= 11;
  return (
    digits.length <= 10 || (digits.length === 11 && digits.startsWith("1"))
  );
}

/**
 * A North American number as it's typed, "(503) 555-0187", the country code kept when it's written; other
 * numbers stay as written, since grouping them right takes each country's rules.
 */
export function formatPhone(value: string): string {
  if (!northAmerican(value)) return value;
  const all = digitsOf(value);
  const plus = value.trim().startsWith("+");
  const country = plus || (all.length === 11 && all.startsWith("1"));
  const digits = country ? all.slice(1) : all;
  const prefix = country ? (plus ? "+1 " : "1 ") : "";
  const area = digits.slice(0, 3);
  const exchange = digits.slice(3, 6);
  const line = digits.slice(6, 10);
  if (digits.length === 0) return plus ? "+1" : country ? "1" : "";
  if (digits.length <= 3) return `${prefix}${area}`;
  if (digits.length <= 6) return `${prefix}(${area}) ${exchange}`;
  return `${prefix}(${area}) ${exchange}-${line}`;
}

/**
 * `edited` with a phone number formatted as it's typed and the caret after the same digit it followed, so
 * typing or deleting in the middle never throws the caret to the end. An email is left as written.
 */
export function formatIdentifier(edited: Edited): Edited {
  if (identifierKind(edited.value) !== "phone") return edited;
  const value = formatPhone(edited.value);
  const before = digitsOf(edited.value.slice(0, edited.caret)).length;
  if (before === 0) return { value, caret: value.startsWith("+") ? 1 : 0 };
  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index] ?? "")) seen += 1;
    if (seen === before) return { value, caret: index + 1 };
  }
  return { value, caret: value.length };
}

/** Whether `value` is an email address or a phone number a code can be sent to. */
export function validIdentifier(value: string): boolean {
  const text = value.trim();
  const kind = identifierKind(text);
  switch (kind) {
    case "email":
      return EMAIL.test(text);
    case "phone": {
      const digits = digitsOf(text);
      if (text.startsWith("+"))
        return digits.length >= 8 && digits.length <= 15;
      return (
        digits.length === 10 || (digits.length === 11 && digits.startsWith("1"))
      );
    }
    case "unknown":
      return false;
    default: {
      const unknownKind: never = kind;
      return unknownKind;
    }
  }
}

/**
 * Where a code went, with most of it hidden: "••• ••• 0187" for a phone, "a•••@example.com" for an email,
 * enough to recognize without showing it whole.
 */
export function maskedIdentifier(value: string): string {
  const text = value.trim();
  if (identifierKind(text) === "email") {
    const [name = "", domain = ""] = text.split("@");
    return `${name.slice(0, 1)}•••@${domain}`;
  }
  return `••• ••• ${digitsOf(text).slice(-4)}`;
}
