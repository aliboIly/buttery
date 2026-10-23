import { Text } from "@butteryui/core";
import type { DemoSection, DocsPage, LiveDemo } from "@butteryui/core";
import { AuthFlow } from "@butteryui/react";

export const page: DocsPage = {
  section: "patterns",
  title: "AuthFlow",
  description:
    "A passwordless sign-in or sign-up with a one-time code: an email or phone number, then the code, on one surface.",
  order: 45,
  status: "new",
  since: "0.10.0",
  home: "patterns/authentication",
};

export const live: LiveDemo = {
  controls: {
    codeLength: { kind: "number", initial: 6, min: 4, max: 8 },
    resendAfter: { kind: "number", initial: 30, min: 5, max: 60, step: 5 },
    passkey: { kind: "toggle", initial: false },
  },
  render: ({ codeLength, resendAfter, passkey }) => (
    <AuthFlow
      codeLength={Number(codeLength)}
      resendAfter={Number(resendAfter)}
      passkey={passkey === true}
      titleAs="h2"
      hint={
        <Text variant="body-sm" tone="secondary">
          {`Any ${String(codeLength)} digits sign you in here.`}
        </Text>
      }
      onRequestCode={() => ({ ok: true, expiresIn: 600 })}
      onVerify={(identifier) => ({ ok: true, session: identifier })}
    />
  ),
  code: ({ codeLength, resendAfter, passkey }) =>
    [
      "<AuthFlow",
      ...(Number(codeLength) === 6
        ? []
        : [`  codeLength={${String(codeLength)}}`]),
      ...(Number(resendAfter) === 30
        ? []
        : [`  resendAfter={${String(resendAfter)}}`]),
      ...(passkey === true ? ["  passkey"] : []),
      "  onRequestCode={(identifier) => api.sendCode(identifier)}",
      "  onVerify={(identifier, code) => api.verify(identifier, code)}",
      '  onSuccess={(session) => { navigate("/"); }}',
      "/>",
    ].join("\n"),
};

export const demos: readonly DemoSection[] = [
  {
    title: "With terms",
    description:
      "Links to the terms and the privacy policy under the button, in a small line.",
    render: () => (
      <AuthFlow
        titleAs="h3"
        terms={
          <>
            By going on you agree to the <a href="#terms">terms</a> and the{" "}
            <a href="#privacy">privacy policy</a>.
          </>
        }
        onRequestCode={() => ({ ok: true })}
        onVerify={() => ({ ok: false, reason: "wrong" })}
      />
    ),
  },
];
