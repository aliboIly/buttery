import { useState } from "react";
import type { ReactElement } from "react";
import { Stack, Text } from "@buttery/core";
import type { ExampleKind, ExamplePlay } from "@buttery/core";
import { SignInForm, SignUpForm, Tabs } from "@buttery/react";

/** An account page's tabs: sign in under one, create an account under the other. */
export function AccountTabs(): ReactElement {
  const [note, setNote] = useState("");
  return (
    <Stack gap={4}>
      <Tabs defaultValue="sign-in">
        <Tabs.List label="Your account">
          <Tabs.Tab value="sign-in">Sign in</Tabs.Tab>
          <Tabs.Tab value="create">Create an account</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="sign-in">
          <SignInForm
            titleAs="h2"
            title="Welcome back"
            onSubmit={({ email }) => {
              setNote(`Signed in as ${email}.`);
              return undefined;
            }}
          />
        </Tabs.Panel>
        <Tabs.Panel value="create">
          <SignUpForm
            titleAs="h2"
            termsHref="#terms"
            onSubmit={({ name }) => {
              setNote(`Welcome, ${name}. Your account is ready.`);
              return undefined;
            }}
          />
        </Tabs.Panel>
      </Tabs>
      {note === "" ? null : (
        <Text variant="body" tone="secondary">
          {note}
        </Text>
      )}
    </Stack>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("tab", "Create an account");
  await see("Create your account");
  await press("button", "Create account");
  await see("Enter your name");
};
