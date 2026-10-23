import { useState } from "react";
import type { ReactElement } from "react";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { OneTimeCodeField } from "@butteryui/react";
import type { OneTimeCodeStatus } from "@butteryui/react";

/** A code checked as soon as its last digit is in: 246810 signs in, any other code is turned down. */
export function VerifyCode(): ReactElement {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<OneTimeCodeStatus>("idle");
  const [error, setError] = useState("");
  const verify = (value: string): void => {
    setStatus("verifying");
    window.setTimeout(() => {
      if (value === "246810") {
        setStatus("success");
      } else {
        setStatus("error");
        setError("That code isn't right. Check it and try again.");
        setCode("");
      }
    }, 200);
  };
  return (
    <OneTimeCodeField
      value={code}
      onValueChange={(value) => {
        setCode(value);
        if (status === "error") setStatus("idle");
      }}
      onComplete={verify}
      status={status}
      message={status === "error" ? error : "The code works for 10 minutes."}
    />
  );
}

export const kind: ExampleKind = "basic";

export const play: ExamplePlay = async ({ type, see }) => {
  await type("One-time code", "246810");
  await see("Signed in");
};
