import { Mail } from "lucide-react";
import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, TextField } from "@butteryui/react";

/** The sizes and looks: a small soft field for a toolbar, md for forms in an app, lg with 16px text for a sign-in page. */
export function Sizes(): ReactElement {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  return (
    <Stack gap={6}>
      <TextField
        label="Batch code"
        size="sm"
        variant="soft"
        defaultValue="HM-0412"
      />
      <TextField label="Coffee name" defaultValue="Halfmoon House" />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSent(email);
        }}
      >
        <Stack gap={3}>
          <TextField
            label="Email"
            size="lg"
            type="email"
            autoComplete="email"
            iconStart={Mail}
            value={email}
            onValueChange={setEmail}
          />
          <Button type="submit" variant="primary" size="cta">
            Email me a sign-in link
          </Button>
          {sent === "" ? null : (
            <Text variant="body" tone="secondary">
              {`We sent a sign-in link to ${sent}`}
            </Text>
          )}
        </Stack>
      </form>
    </Stack>
  );
}

export const kind: ExampleKind = "variants";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await type("Email", "sam@example.com");
  await press("button", "Email me a sign-in link");
  await see("We sent a sign-in link to sam@example.com");
};
