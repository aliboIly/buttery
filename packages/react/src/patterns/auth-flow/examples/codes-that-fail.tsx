import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { AuthFlow } from "@butteryui/react";
import type { VerifyResult } from "@butteryui/react";

/** What each failure says: 111111 is wrong, 222222 has expired, and 333333 is one try too many. */
export function CodesThatFail(): ReactElement {
  const verify = (code: string): VerifyResult<string> => {
    if (code === "222222") return { ok: false, reason: "expired" };
    if (code === "333333") return { ok: false, reason: "too-many" };
    return { ok: false, reason: "wrong" };
  };
  return (
    <AuthFlow
      defaultIdentifier="(215) 555-0134"
      resendAfter={5}
      hint={
        <Text variant="body-sm" tone="secondary">
          Try 111111, 222222 or 333333.
        </Text>
      }
      onRequestCode={() => ({ ok: true, expiresIn: 300 })}
      onVerify={(_identifier, code) => verify(code)}
    />
  );
}

export const kind: ExampleKind = "states";

export const play: ExamplePlay = async ({ type, press, see }) => {
  await press("button", "Continue");
  await see("Check your texts");
  await type("One-time code", "222222");
  await see("That code has expired. Send a new one.");
};
