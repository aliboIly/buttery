import type { RequestCodeResult, VerifyResult } from "@butteryui/react";

/** The code the stand-ins below accept, shown on the sign-in screen until your server sends real ones. */
export const DEMO_CODE = "123456";

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

/**
 * Sends a sign-in code to an email address or a phone number. It stands in for your server: replace it with
 * a call that sends one, whether or not an account exists, and says how many seconds the code lasts.
 */
export const sendCode: (
  identifier: string,
) => Promise<RequestCodeResult> = async () => {
  await wait(500);
  return { ok: true, expiresIn: 600 };
};

/**
 * Checks a code and returns the session, here just who signed in. It stands in for your server too: replace
 * it with a call that checks the code, creates the account on a first sign-in, and returns the session.
 */
export const verifyCode: (
  identifier: string,
  code: string,
) => Promise<VerifyResult<string>> = async (identifier, code) => {
  await wait(200);
  return code === DEMO_CODE
    ? { ok: true, session: identifier }
    : { ok: false, reason: "wrong" };
};
