import {
  Morph,
  Stack,
  Text,
  TextStack,
  cx,
  durations,
  easingCurves,
  useAnimationTracking,
  useMergedRefs,
  useMotionPreference,
} from "@butteryui/core";
import type { TextStackTitleElement } from "@butteryui/core";
import { motion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { Button } from "../../components/button/Button.tsx";
import { IdentifierField } from "../../components/identifier-field/IdentifierField.tsx";
import { OneTimeCodeField } from "../../components/one-time-code-field/OneTimeCodeField.tsx";
import { Spinner } from "../../parts/spinner/Spinner.tsx";
import { identifierKind, validIdentifier } from "./identifier.ts";
import { useOtpFlow } from "./use-otp-flow.ts";
import type { OtpFlowOptions, OtpStep } from "./use-otp-flow.ts";

/** Everything an `AuthFlow` says, for another language or another voice. */
export interface AuthFlowLabels {
  /** The first step's title. Defaults to `"Sign in or create an account"`. */
  readonly title: string;
  /** The line under it. */
  readonly description: string;
  /** The first step's button. Defaults to `"Continue"`. */
  readonly submit: string;
  /** The button while the code is on its way. Defaults to `"Sending your code…"`. */
  readonly sending: string;
  /** Said when the button is pressed with the field empty. */
  readonly empty: string;
  /** Said when the button is pressed with something that isn't an email address or a phone number. */
  readonly invalid: string;
  /** The code step's title, for where the code went. */
  readonly codeTitle: (kind: "email" | "phone") => string;
  /** The line under it, with where the code went, mostly hidden. */
  readonly sentTo: (destination: string) => string;
  /** The note under the code field, when the app says how long a code lasts. */
  readonly expires: (minutes: number) => string;
  /** The way to ask for another code, once it's allowed. Defaults to `"Send a new code"`. */
  readonly resend: string;
  /** What shows until another code can be asked for. */
  readonly resendIn: (seconds: number) => string;
  /** The way back to the first step, the field still filled in. Defaults to `"Change email or phone"`. */
  readonly back: string;
  /** Under the code field while the code is checked. Defaults to `"Checking the code…"`. */
  readonly verifying: string;
  /** Under the code field once it's accepted. Defaults to `"You're signed in"`. */
  readonly success: string;
}

/** Props for `AuthFlow`, with the callbacks of `useOtpFlow`. */
export interface AuthFlowProps<Session>
  extends
    Omit<ComponentPropsWithRef<"div">, "title" | "children">,
    OtpFlowOptions<Session> {
  /** A mark over the title, such as the app's logo. */
  readonly logo?: ReactNode;
  /** A small line under the first step's button, such as links to the terms and the privacy policy. */
  readonly terms?: ReactNode;
  /** Something under the code field, such as where a demo's code is. */
  readonly hint?: ReactNode;
  /** Offers saved passkeys in the first step's field too. Defaults to `false`. */
  readonly passkey?: boolean | undefined;
  /** What the titles render as. Defaults to `"h1"`, for a screen of its own. */
  readonly titleAs?: TextStackTitleElement | undefined;
  /** The words, any of them. */
  readonly labels?: Partial<AuthFlowLabels> | undefined;
}

const LABELS: AuthFlowLabels = {
  title: "Sign in or create an account",
  description: "You'll get a code instead of a password.",
  submit: "Continue",
  sending: "Sending your code…",
  empty: "Enter your email address or phone number.",
  invalid:
    "Enter a full email address or phone number, such as name@example.com or (503) 555-0142.",
  codeTitle: (kind) =>
    kind === "email" ? "Check your email" : "Check your texts",
  sentTo: (destination) => `We sent a code to ${destination}.`,
  expires: (minutes) =>
    `The code works for ${String(minutes)} minute${minutes === 1 ? "" : "s"}.`,
  resend: "Send a new code",
  resendIn: (seconds) => `You can ask for a new code in ${String(seconds)}s.`,
  back: "Change email or phone",
  verifying: "Checking the code…",
  success: "You're signed in",
};

/** How far a step slides as it comes or goes, in px: 8, in the direction of travel. */
const TRAVEL = 8;

function StepView({
  step,
  rtl,
  children,
}: {
  readonly step: OtpStep;
  readonly rtl: boolean;
  readonly children: ReactNode;
}): ReactElement {
  const tracking = useAnimationTracking();
  const reduced = useMotionPreference() === "reduced";
  // The first step only ever leaves forward and comes back from behind; the code step the other way round.
  const side = (step === "identify" ? -TRAVEL : TRAVEL) * (rtl ? -1 : 1);
  return (
    <motion.div
      {...tracking}
      data-bt-part="step"
      initial={reduced ? false : { x: side }}
      animate={{ x: 0 }}
      {...(reduced ? {} : { exit: { x: side } })}
      transition={{ duration: durations.base / 1000, ease: easingCurves.out }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A passwordless sign-in or sign-up with a one-time code, as one surface: an email address or a phone
 * number first, then the code sent to it, the step changing with a short slide and the height following.
 * buttery never sends a code or talks to a server: the app passes `onRequestCode` and `onVerify`, and gets
 * the session in `onSuccess`. It never says whether an account exists, so the same screen signs people in
 * and signs them up. `useOtpFlow` is the same flow without the UI.
 *
 * @example
 * <AuthFlow
 *   logo={<AppMark />}
 *   onRequestCode={(identifier) => api.sendCode(identifier)}
 *   onVerify={(identifier, code) => api.verify(identifier, code)}
 *   onSuccess={(session) => { navigate("/"); }}
 * />
 */
export function AuthFlow<Session>({
  onRequestCode,
  onVerify,
  onSuccess,
  codeLength,
  resendAfter,
  successHold,
  defaultIdentifier,
  logo,
  terms,
  hint,
  passkey = false,
  titleAs = "h1",
  labels,
  className,
  ref,
  ...rest
}: AuthFlowProps<Session>): ReactElement {
  const words = { ...LABELS, ...labels };
  const flow = useOtpFlow<Session>({
    onRequestCode,
    onVerify,
    onSuccess,
    codeLength,
    resendAfter,
    successHold,
    defaultIdentifier,
  });
  const [attempt, setAttempt] = useState<string | null>(null);
  const [rtl, setRtl] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, root);
  const identifierInput = useRef<HTMLInputElement>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const shownStep = useRef(flow.step);
  const ready = validIdentifier(flow.identifier);
  const kind = identifierKind(flow.identifier) === "email" ? "email" : "phone";
  const done = flow.status === "success";

  useLayoutEffect(() => {
    if (root.current)
      setRtl(getComputedStyle(root.current).direction === "rtl");
  }, []);

  const leave = useRef<() => boolean>(() => false);
  useLayoutEffect(() => {
    leave.current = () => {
      if (flow.step !== "code" || done) return false;
      flow.back();
      return true;
    };
  });

  // Escape anywhere in the code step goes back, from the field or from the buttons under it.
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return undefined;
    const press = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (leave.current()) event.preventDefault();
    };
    element.addEventListener("keydown", press);
    return () => {
      element.removeEventListener("keydown", press);
    };
  }, []);

  // Focus moves with the step before it's painted; it never waits for the slide.
  useLayoutEffect(() => {
    if (shownStep.current === flow.step) return;
    shownStep.current = flow.step;
    (flow.step === "code" ? codeInput : identifierInput).current?.focus();
  }, [flow.step]);

  const submit = (): void => {
    if (flow.sending) return;
    if (!ready) {
      setAttempt(flow.identifier.trim() === "" ? words.empty : words.invalid);
      identifierInput.current?.focus();
      return;
    }
    void flow.sendCode();
  };

  const identify = (
    <form
      noValidate
      aria-busy={flow.sending || undefined}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Stack gap={6}>
        <TextStack
          size="feature"
          align="center"
          titleAs={titleAs}
          title={words.title}
          body={words.description}
        />
        <Stack gap={3}>
          <IdentifierField
            ref={identifierInput}
            onKeyDown={(event) => {
              // The button can't act until the field is whole, so Enter says what's missing instead.
              if (event.key === "Enter" && !ready && !flow.sending) {
                event.preventDefault();
                setAttempt(
                  flow.identifier.trim() === "" ? words.empty : words.invalid,
                );
              }
            }}
            value={flow.identifier}
            onValueChange={(value) => {
              flow.setIdentifier(value);
              setAttempt(null);
            }}
            error={attempt ?? flow.requestError ?? undefined}
            passkey={passkey}
          />
          <Button
            type="submit"
            variant="primary"
            size="cta"
            shape="rounded"
            arrow={flow.sending ? undefined : "forward"}
            aria-disabled={!ready || flow.sending || undefined}
            data-bt-part="submit"
          >
            {flow.sending ? (
              <span data-bt-part="sending">
                <span data-bt-part="sending-mark">
                  <Spinner />
                </span>
                {words.sending}
              </span>
            ) : (
              words.submit
            )}
          </Button>
        </Stack>
        {terms === undefined ? null : (
          <Text
            variant="caption"
            tone="tertiary"
            data-bt-part="auth-flow-terms"
          >
            {terms}
          </Text>
        )}
      </Stack>
    </form>
  );

  const code = (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (flow.code.length === flow.codeLength) void flow.verify(flow.code);
      }}
    >
      <Stack gap={6}>
        <TextStack
          size="feature"
          align="center"
          titleAs={titleAs}
          title={words.codeTitle(kind)}
          body={words.sentTo(flow.destination)}
        />
        <OneTimeCodeField
          ref={codeInput}
          hideLabel
          length={flow.codeLength}
          value={flow.code}
          onValueChange={flow.setCode}
          onComplete={(value) => {
            void flow.verify(value);
          }}
          status={flow.status}
          message={
            flow.codeError ??
            (flow.expiresIn === null
              ? undefined
              : words.expires(Math.max(1, Math.round(flow.expiresIn / 60))))
          }
          labels={{ verifying: words.verifying, success: words.success }}
        />
        <Stack gap={4}>
          {hint === undefined ? null : (
            <div data-bt-part="auth-flow-hint">{hint}</div>
          )}
          <Stack gap={2}>
            <div data-bt-part="resend">
              {flow.resendIn > 0 ? (
                <Text
                  variant="body-sm"
                  tone="tertiary"
                  data-bt-part="countdown"
                >
                  {words.resendIn(flow.resendIn)}
                </Text>
              ) : (
                <Button
                  variant="ghost"
                  aria-disabled={done || undefined}
                  onClick={() => {
                    if (!done) void flow.resend();
                  }}
                >
                  {words.resend}
                </Button>
              )}
            </div>
            <div data-bt-part="auth-flow-back">
              <Button
                variant="ghost"
                arrow="back"
                aria-disabled={done || undefined}
                onClick={() => {
                  if (!done) flow.back();
                }}
              >
                {words.back}
              </Button>
            </div>
          </Stack>
        </Stack>
      </Stack>
    </form>
  );

  return (
    <div
      {...rest}
      ref={refs}
      className={cx("bt-auth-flow", className)}
      data-bt="AuthFlow"
      data-step={flow.step}
    >
      <div data-bt-part="column">
        {logo === undefined ? null : <div data-bt-part="logo">{logo}</div>}
        <Morph contentKey={flow.step}>
          <StepView step={flow.step} rtl={rtl}>
            {flow.step === "identify" ? identify : code}
          </StepView>
        </Morph>
      </div>
    </div>
  );
}
