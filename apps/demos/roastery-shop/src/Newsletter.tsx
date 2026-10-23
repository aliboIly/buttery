import { useState } from "react";
import type { ReactElement, SubmitEvent } from "react";
import { Stack, Stagger } from "@butteryui/core";
import {
  Button,
  CenteredHero,
  TextField,
  looksLikeEmail,
  toast,
} from "@butteryui/react";

/** The page's closing band: a letter about new coffees, with an email field that checks what's typed. */
export function Newsletter(): ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const join = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const address = email.trim();
    if (address === "") {
      setError("Enter your email address to get the letter.");
      return;
    }
    if (!looksLikeEmail(address)) {
      setError("Enter an email address like name@example.com.");
      return;
    }
    setEmail("");
    toast.success("You're on the list for the next letter.", {
      id: "newsletter",
    });
  };
  return (
    <CenteredHero
      id="letter"
      titleAs="h2"
      title="New coffees, first."
      body="One short letter when a harvest lands, about once a month: what's arrived, who grew it and how we'd brew it."
      visual={
        <Stagger.Item className="shop-letter">
          <form onSubmit={join} noValidate>
            <Stack gap={3}>
              <TextField
                label="Email address"
                type="email"
                size="lg"
                autoComplete="email"
                inputMode="email"
                value={email}
                error={error}
                onValueChange={(next) => {
                  setEmail(next);
                  setError(undefined);
                }}
              />
              <Button
                type="submit"
                variant="primary"
                size="cta"
                shape="rounded"
              >
                Send me the letter
              </Button>
            </Stack>
          </form>
        </Stagger.Item>
      }
    />
  );
}
