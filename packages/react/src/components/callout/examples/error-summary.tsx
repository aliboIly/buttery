import { useId, useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Callout, TextField } from "@butteryui/react";

/** A sign-in form's error summary, read out as it appears after a failed submit, with links to the fields. */
export function ErrorSummary(): ReactElement {
  const emailId = useId();
  const passwordId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const emailError =
    email.trim() === "" ? "Enter your email address" : undefined;
  const passwordError = password === "" ? "Enter your password" : undefined;
  const problems = [
    { id: emailId, text: emailError },
    { id: passwordId, text: passwordError },
  ].filter((problem) => problem.text !== undefined);
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Stack gap={4}>
        {submitted && problems.length > 0 ? (
          <Callout tone="danger" title="There's a problem" role="alert">
            <ul>
              {problems.map((problem) => (
                <li key={problem.id}>
                  <a href={`#${problem.id}`}>{problem.text}</a>
                </li>
              ))}
            </ul>
          </Callout>
        ) : null}
        {submitted && problems.length === 0 ? (
          <Callout tone="success" title="Signed in" role="status">
            Welcome back to the roastery.
          </Callout>
        ) : null}
        <TextField
          id={emailId}
          label="Email"
          type="email"
          value={email}
          onValueChange={setEmail}
          error={submitted ? emailError : undefined}
          announceError={false}
        />
        <TextField
          id={passwordId}
          label="Password"
          type="password"
          value={password}
          onValueChange={setPassword}
          error={submitted ? passwordError : undefined}
          announceError={false}
        />
        <Inline>
          <Button type="submit" variant="primary">
            Sign in
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}

export const kind: ExampleKind = "composition";

export const play: ExamplePlay = async ({ press, type, see }) => {
  await press("button", "Sign in");
  await see("There's a problem");
  await type("Email", "rosa@northside.example");
  await type("Password", "first-crack");
  await press("button", "Sign in");
  await see("Signed in");
};
