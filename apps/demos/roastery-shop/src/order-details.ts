import { looksLikeEmail } from "@buttery/react";

/** Where an order goes, and the email its receipt goes to. */
export interface Address {
  readonly email: string;
  readonly name: string;
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zip: string;
}

export const EMPTY_ADDRESS: Address = {
  email: "",
  name: "",
  street: "",
  city: "",
  state: "",
  zip: "",
};

/** The card an order is paid with. */
export interface Card {
  readonly number: string;
  readonly expiry: string;
  readonly code: string;
}

export const EMPTY_CARD: Card = { number: "", expiry: "", code: "" };

/** What's wrong with a form, by field, for the fields that have something wrong. */
export type Problems<Form> = Partial<Record<keyof Form, string>>;

/** The month the demo takes as now, matching the roastery's own dashboard. */
const THIS_MONTH = { year: 2026, month: 10 };

/** What to fix in a delivery address before the order can go on to payment. */
export function addressProblems(address: Address): Problems<Address> {
  const problems: Problems<Address> = {};
  const email = address.email.trim();
  if (email === "")
    problems.email = "Enter your email address, so we can send your receipt.";
  else if (!looksLikeEmail(email))
    problems.email = "Enter an email address like name@example.com.";
  if (address.name.trim() === "")
    problems.name = "Enter the name to put on the parcel.";
  if (address.street.trim() === "")
    problems.street = "Enter the street address.";
  if (address.city.trim() === "") problems.city = "Enter the city.";
  if (!/^[A-Za-z]{2}$/.test(address.state.trim()))
    problems.state = "Enter the state's two letters, like OR.";
  if (!/^\d{5}(?:-\d{4})?$/.test(address.zip.trim()))
    problems.zip = "Enter a 5-digit ZIP code.";
  return problems;
}

/** A card number's digits, without the spaces or dashes it was typed with. */
export function cardDigits(number: string): string {
  return number.replaceAll(/[\s-]/g, "");
}

/** What to fix in a card before the order can be paid for. */
export function cardProblems(card: Card): Problems<Card> {
  const problems: Problems<Card> = {};
  if (!/^\d{13,19}$/.test(cardDigits(card.number)))
    problems.number = "Enter the long number on the front of the card.";
  const expiry = /^(\d{2})\s*\/\s*(\d{2})$/.exec(card.expiry.trim());
  const month = Number(expiry?.[1]);
  const year = 2000 + Number(expiry?.[2]);
  if (expiry === null || month < 1 || month > 12)
    problems.expiry = "Enter the month and year, like 08/28.";
  else if (
    year < THIS_MONTH.year ||
    (year === THIS_MONTH.year && month < THIS_MONTH.month)
  )
    problems.expiry = "This card has expired.";
  if (!/^\d{3,4}$/.test(card.code.trim()))
    problems.code = "Enter the 3 or 4 digits on the card.";
  return problems;
}

/** Whether a form has nothing left to fix. */
export function isClear<Form>(problems: Problems<Form>): boolean {
  return Object.keys(problems).length === 0;
}
