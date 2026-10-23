import type { ReactElement } from "react";
import { Text } from "@butteryui/core";
import { AuthFlow } from "@butteryui/react";
import { DEMO_CODE, sendCode, verifyCode } from "../auth.ts";
import { useNavigate } from "../router.tsx";

/** Signing in with a code sent to an email or phone, on a screen of its own, then on to the overview. */
export function SignInPage({ name }: { readonly name: string }): ReactElement {
  const navigate = useNavigate();
  return (
    <main className="sign-in">
      <AuthFlow
        logo={
          <Text variant="title" asChild>
            <span>{name}</span>
          </Text>
        }
        hint={
          <Text variant="body-sm" tone="secondary">
            {`Demo code: ${DEMO_CODE}`}
          </Text>
        }
        onRequestCode={sendCode}
        onVerify={verifyCode}
        onSuccess={() => {
          navigate("/");
        }}
      />
    </main>
  );
}
