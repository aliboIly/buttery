import { Icon, Inline, Text } from "@butteryui/core";
import { AuthFlow } from "@butteryui/react";
import { Coffee } from "lucide-react";
import type { ReactElement } from "react";

/** The code this demo accepts, shown under the code field so anyone can try it. */
export const DEMO_CODE = "123456";

/** The roastery's sign-in screen, before the dashboard: a code instead of a password, the demo's code in its hint. */
export function SignIn({
  onSignedIn,
}: {
  readonly onSignedIn: (identifier: string) => void;
}): ReactElement {
  return (
    <main className="rs-sign-in">
      <AuthFlow
        logo={
          <Inline gap={2} align="center">
            <Icon icon={Coffee} />
            <Text variant="title" asChild>
              <span>Halfmoon Roastery</span>
            </Text>
          </Inline>
        }
        hint={
          <Text variant="body-sm" tone="secondary">
            {`Demo code: ${DEMO_CODE}`}
          </Text>
        }
        onRequestCode={async () => {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 600);
          });
          return { ok: true, expiresIn: 600 };
        }}
        onVerify={async (identifier, code) => {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 200);
          });
          return code === DEMO_CODE
            ? { ok: true, session: identifier }
            : { ok: false, reason: "wrong" };
        }}
        onSuccess={onSignedIn}
      />
    </main>
  );
}
