import { useEffect, useRef, useState } from "react";
import { maskedIdentifier } from "./identifier.ts";

/** Why a code couldn't be sent. */
export type RequestCodeFailure = "invalid" | "rate-limited" | "unavailable";

/** Why a code wasn't accepted. */
export type VerifyFailure = "wrong" | "expired" | "too-many" | "unavailable";

/** What sending a code came to: sent, with how long it lasts, or why not. */
export type RequestCodeResult =
  | {
      readonly ok: true;
      /** Seconds until the code stops working, for the note under the field. */
      readonly expiresIn?: number | undefined;
    }
  | {
      readonly ok: false;
      readonly reason: RequestCodeFailure;
      /** What to show instead of the default message for `reason`. */
      readonly message?: string | undefined;
    };

/** What checking a code came to: a session to hand on, or why not. */
export type VerifyResult<Session> =
  | { readonly ok: true; readonly session: Session }
  | {
      readonly ok: false;
      readonly reason: VerifyFailure;
      /** What to show instead of the default message for `reason`. */
      readonly message?: string | undefined;
    };

/** What the app does at each step; buttery never sends a code or talks to a server itself. */
export interface OtpFlowOptions<Session> {
  /** Sends a code to `identifier`, an email address or a phone number as typed. */
  readonly onRequestCode: (
    identifier: string,
  ) => RequestCodeResult | Promise<RequestCodeResult>;
  /** Checks `code` for `identifier`. */
  readonly onVerify: (
    identifier: string,
    code: string,
  ) => VerifyResult<Session> | Promise<VerifyResult<Session>>;
  /** Called with the session once the code is accepted and the success state has shown for `successHold`. */
  readonly onSuccess?: ((session: Session) => void) | undefined;
  /** Digits in a code. Defaults to `6`. */
  readonly codeLength?: number | undefined;
  /** Seconds before a new code can be asked for. Defaults to `30`. */
  readonly resendAfter?: number | undefined;
  /** Milliseconds the success state shows before `onSuccess`. Defaults to `800`. */
  readonly successHold?: number | undefined;
  /** The identifier the field starts with, such as one the app remembers. Defaults to `""`. */
  readonly defaultIdentifier?: string | undefined;
}

/** Which step the flow is on: asking who's signing in, or asking for their code. */
export type OtpStep = "identify" | "code";

/** Where checking a code stands. */
export type CodeStatus = "idle" | "verifying" | "success" | "error";

/** Everything a sign-in screen needs to draw and drive a one-time-code flow. */
export interface OtpFlow {
  /** Which step it's on. */
  readonly step: OtpStep;
  /** The email address or phone number, as typed. */
  readonly identifier: string;
  /** Changes the identifier, such as from `IdentifierField`'s `onValueChange`. */
  readonly setIdentifier: (value: string) => void;
  /** Whether a code is on its way, for the button's "Sending code…". */
  readonly sending: boolean;
  /** Why the last code couldn't be sent, said as what to do next, or `null`. */
  readonly requestError: string | null;
  /** Sends a code to the identifier and moves to the code step once it's sent. */
  readonly sendCode: () => Promise<void>;
  /** Where the code went, mostly hidden, such as "••• ••• 0187". */
  readonly destination: string;
  /** The code's digits typed so far. */
  readonly code: string;
  /** Changes the code, such as from `OneTimeCodeField`'s `onValueChange`; typing after an error clears it. */
  readonly setCode: (value: string) => void;
  /** Where checking the code stands, for `OneTimeCodeField`'s `status`. */
  readonly status: CodeStatus;
  /** Why the last code wasn't accepted, or why a new one couldn't be sent, said as what to do next. */
  readonly codeError: string | null;
  /** Checks a full code. A code that's being checked, or was accepted, isn't checked again. */
  readonly verify: (code: string) => Promise<void>;
  /** Seconds until a new code can be asked for; `0` when it can. */
  readonly resendIn: number;
  /** Sends a new code once `resendIn` is `0`, staying on the code step. */
  readonly resend: () => Promise<void>;
  /** Seconds the code lasts, from when it was sent, or `null` when the app didn't say. */
  readonly expiresIn: number | null;
  /** Back to the first step, the identifier still filled in. */
  readonly back: () => void;
  /** Digits in a code. */
  readonly codeLength: number;
}

const REQUEST_MESSAGES: Readonly<Record<RequestCodeFailure, string>> = {
  invalid:
    "That doesn't look like an email address or a phone number. Check it and try again.",
  "rate-limited": "Too many codes sent. Try again in a minute.",
  unavailable: "We couldn't send a code. Check your connection.",
};

const VERIFY_MESSAGES: Readonly<Record<VerifyFailure, string>> = {
  wrong: "That code isn't right. Check it and try again.",
  expired: "That code has expired. Send a new one.",
  "too-many": "Too many tries. Send a new code.",
  unavailable: "We couldn't check the code. Check your connection.",
};

/**
 * A passwordless sign-in or sign-up with a one-time code, without the UI: the step it's on, the identifier
 * and code, sending, checking, the resend countdown and errors that say what to do next. It never says
 * whether an account exists, so one flow serves signing in and signing up. `AuthFlow` draws it.
 *
 * @example
 * const flow = useOtpFlow({
 *   onRequestCode: (identifier) => api.sendCode(identifier),
 *   onVerify: (identifier, code) => api.verify(identifier, code),
 *   onSuccess: (session) => { navigate("/"); },
 * });
 */
export function useOtpFlow<Session>(options: OtpFlowOptions<Session>): OtpFlow {
  const codeLength = options.codeLength ?? 6;
  const resendAfter = options.resendAfter ?? 30;
  const successHold = options.successHold ?? 800;
  const [step, setStep] = useState<OtpStep>("identify");
  const [identifier, setIdentifier] = useState(options.defaultIdentifier ?? "");
  const [sending, setSending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<CodeStatus>("idle");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [resendAt, setResendAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const latest = useRef(options);
  const live = useRef(false);
  const busy = useRef(false);
  const handoff = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
      if (handoff.current !== null) clearTimeout(handoff.current);
    };
  }, []);

  useEffect(() => {
    if (step !== "code" || resendAt === null) return undefined;
    const tick = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(tick);
    };
  }, [step, resendAt]);

  const resendIn =
    step === "code" && resendAt !== null
      ? Math.max(0, Math.ceil((resendAt - now) / 1000))
      : 0;

  const request = async (): Promise<RequestCodeResult> => {
    try {
      return await latest.current.onRequestCode(identifier);
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  };

  const sent = (expires: number | undefined): void => {
    const start = Date.now();
    setNow(start);
    setResendAt(start + resendAfter * 1000);
    setExpiresIn(expires ?? null);
    setCode("");
    setStatus("idle");
    setCodeError(null);
  };

  const sendCode = async (): Promise<void> => {
    if (busy.current) return;
    busy.current = true;
    setSending(true);
    setRequestError(null);
    const result = await request();
    busy.current = false;
    if (!live.current) return;
    setSending(false);
    if (result.ok) {
      sent(result.expiresIn);
      setStep("code");
    } else {
      setRequestError(result.message ?? REQUEST_MESSAGES[result.reason]);
    }
  };

  const resend = async (): Promise<void> => {
    if (busy.current || resendIn > 0) return;
    busy.current = true;
    const result = await request();
    busy.current = false;
    if (!live.current) return;
    if (result.ok) sent(result.expiresIn);
    else setCodeError(result.message ?? REQUEST_MESSAGES[result.reason]);
  };

  const verify = async (value: string): Promise<void> => {
    if (busy.current || value.length !== codeLength) return;
    if (status === "verifying" || status === "success") return;
    busy.current = true;
    setStatus("verifying");
    setCodeError(null);
    let result: VerifyResult<Session>;
    try {
      result = await latest.current.onVerify(identifier, value);
    } catch {
      result = { ok: false, reason: "unavailable" };
    }
    busy.current = false;
    if (!live.current) return;
    if (result.ok) {
      setStatus("success");
      const { session } = result;
      handoff.current = setTimeout(() => {
        handoff.current = null;
        latest.current.onSuccess?.(session);
      }, successHold);
    } else {
      setStatus("error");
      setCodeError(result.message ?? VERIFY_MESSAGES[result.reason]);
      setCode("");
    }
  };

  const back = (): void => {
    if (handoff.current !== null) clearTimeout(handoff.current);
    handoff.current = null;
    setStep("identify");
    setCode("");
    setStatus("idle");
    setCodeError(null);
    setResendAt(null);
  };

  return {
    step,
    identifier,
    setIdentifier,
    sending,
    requestError,
    sendCode,
    destination: maskedIdentifier(identifier),
    code,
    setCode: (value) => {
      setCode(value);
      if (status === "error" && value !== "") {
        setStatus("idle");
        setCodeError(null);
      }
    },
    status,
    codeError,
    verify,
    resendIn,
    resend,
    expiresIn,
    back,
    codeLength,
  };
}
