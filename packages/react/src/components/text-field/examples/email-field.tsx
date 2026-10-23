import { Mail } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { TextField } from "@buttery/react";

/** An email address checked when you leave the field, with the browser's autofill. */
export function EmailField(): ReactElement {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const invalid = touched && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  return (
    <TextField
      label="Email"
      type="email"
      autoComplete="email"
      inputMode="email"
      iconStart={Mail}
      value={email}
      onValueChange={setEmail}
      onBlur={() => {
        setTouched(true);
      }}
      error={
        invalid ? "Enter an email address like name@example.com." : undefined
      }
    />
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ type, key, see }) => {
  await type("Email", "sam@");
  await key("Tab");
  await see("Enter an email address like name@example.com.");
};
