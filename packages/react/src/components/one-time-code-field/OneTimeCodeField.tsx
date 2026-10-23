import {
  Icon,
  cx,
  hasContent,
  useButteryTransition,
  useControllableState,
  useMergedRefs,
  useMotionPreference,
} from "@butteryui/core";
import { Check, CircleAlert } from "lucide-react";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import {
  FormFieldCaption,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";
import { Spinner } from "../../parts/spinner/Spinner.tsx";

/** Where a code stands: being typed, being checked, accepted, or turned down. */
export type OneTimeCodeStatus = "idle" | "verifying" | "success" | "error";

/** The words a `OneTimeCodeField` shows while it checks a code and once it's accepted. */
export interface OneTimeCodeLabels {
  /** Under the field while the code is checked. Defaults to `"Verifying…"`. */
  readonly verifying: string;
  /** Under the field once the code is accepted. Defaults to `"Signed in"`. */
  readonly success: string;
}

/** Props for `OneTimeCodeField`. `ref`, `id` and other input props go to the input; `className` and `style` to the field. */
export interface OneTimeCodeFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  | "value"
  | "defaultValue"
  | "children"
  | "size"
  | "maxLength"
  | "type"
  | "inputMode"
  | "autoComplete"
> {
  /** What the field asks for, read with it. Defaults to `"One-time code"`. */
  readonly label?: string | undefined;
  /** Keeps the label for screen readers without showing it, for a step whose title already asks. Defaults to `false`. */
  readonly hideLabel?: boolean | undefined;
  /** Digits in the code, one slot each. Defaults to `6`. */
  readonly length?: number | undefined;
  /** The digits typed so far. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The digits it starts with when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the digits on every change; anything else typed or pasted, such as a dash, is left out. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Called once with the code when every slot is filled; filling it with the same code again doesn't call it twice. */
  readonly onComplete?: ((code: string) => void) | undefined;
  /** Where the code stands. `"error"` draws the danger color and takes focus back. Defaults to `"idle"`. */
  readonly status?: OneTimeCodeStatus | undefined;
  /** A note under the field, such as how long the code lasts, or what went wrong while `status` is `"error"`. */
  readonly message?: ReactNode;
  /** The words for checking and success. */
  readonly labels?: Partial<OneTimeCodeLabels> | undefined;
  /** Fills in a code from a text message where the browser offers it (the Web OTP API). Defaults to `false`. */
  readonly webOtp?: boolean | undefined;
}

const LABELS: OneTimeCodeLabels = {
  verifying: "Verifying…",
  success: "Signed in",
};

interface OtpCredential {
  readonly code: string;
}

function isOtpCredential(value: unknown): value is OtpCredential {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string"
  );
}

/**
 * One input for a one-time code, drawn as a slot per digit. It's a single real input, numeric and marked
 * `one-time-code`, so a code the system offers from a message, a password manager's or a pasted one goes in
 * whole; anything but digits is dropped. It calls `onComplete` once when every slot is full.
 *
 * @example
 * <OneTimeCodeField status={status} message={error} onComplete={(code) => void verify(code)} />
 */
export function OneTimeCodeField({
  label = "One-time code",
  hideLabel = false,
  length = 6,
  value,
  defaultValue,
  onValueChange,
  onComplete,
  status = "idle",
  message,
  labels,
  webOtp = false,
  id,
  className,
  style,
  disabled,
  readOnly,
  ref,
  onFocus,
  onBlur,
  onSelect,
  onChange,
  onPaste,
  "aria-describedby": describedBy,
  ...rest
}: OneTimeCodeFieldProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const digits = current.replace(/\D/g, "").slice(0, length);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);
  const input = useRef<HTMLInputElement | null>(null);
  const refs = useMergedRefs(ref, input);
  const completed = useRef<string | null>(null);
  const finish = useRef(onComplete);
  const pop = useButteryTransition("snappy");
  const reduced = useMotionPreference() === "reduced";
  const ids = useFormFieldIds({
    id,
    describedBy,
    hint: false,
    error: false,
  });
  const statusId = `${ids.error}status`;
  const busy = status === "verifying" || status === "success";
  const shown =
    status === "verifying"
      ? words.verifying
      : status === "success"
        ? words.success
        : null;

  useEffect(() => {
    finish.current = onComplete;
  });

  useEffect(() => {
    if (digits.length < length) completed.current = null;
  }, [digits, length]);

  useEffect(() => {
    if (status === "error") input.current?.focus();
  }, [status]);

  useEffect(() => {
    if (
      !webOtp ||
      typeof window === "undefined" ||
      !("OTPCredential" in window)
    )
      return undefined;
    const controller = new AbortController();
    const request: CredentialRequestOptions & { otp: { transport: string[] } } =
      {
        otp: { transport: ["sms"] },
        signal: controller.signal,
      };
    navigator.credentials
      .get(request)
      .then((credential) => {
        if (!isOtpCredential(credential)) return;
        const code = credential.code.replace(/\D/g, "").slice(0, length);
        setCurrent(code);
        if (code.length === length && completed.current !== code) {
          completed.current = code;
          finish.current?.(code);
        }
      })
      .catch(() => undefined);
    return () => {
      controller.abort();
    };
  }, [webOtp, length, setCurrent]);

  const readCaret = (element: HTMLInputElement): void => {
    setCaret(element.selectionStart ?? element.value.length);
  };

  const accept = (next: string): void => {
    setCurrent(next);
    if (next.length === length && completed.current !== next) {
      completed.current = next;
      onComplete?.(next);
    }
  };

  const active = focused ? Math.min(caret, digits.length, length - 1) : -1;

  return (
    <div
      className={cx("bt-form-field", "bt-one-time-code-field", className)}
      style={style}
      data-bt="OneTimeCodeField"
      data-size="lg"
      data-status={status}
      data-motion={reduced ? "reduced" : undefined}
      data-invalid={status === "error" ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      {hideLabel ? (
        <VisuallyHidden.Root asChild>
          <label htmlFor={ids.control}>{label}</label>
        </VisuallyHidden.Root>
      ) : (
        <FormFieldCaption
          htmlFor={ids.control}
          label={label}
          hint={null}
          hintId={ids.hint}
        />
      )}
      <div data-bt-part="box" data-bt-control="">
        <div data-bt-part="slots" aria-hidden="true">
          {Array.from({ length }, (_, index) => {
            const digit = digits[index];
            return (
              <span
                key={index}
                data-bt-part="slot"
                data-filled={digit === undefined ? undefined : ""}
                data-active={index === active ? "" : undefined}
              >
                {digit ?? <span data-bt-part="dot" />}
                {index === active && digit === undefined ? (
                  <span data-bt-part="caret" />
                ) : null}
              </span>
            );
          })}
        </div>
        <input
          {...rest}
          ref={refs}
          id={ids.control}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={length}
          value={digits}
          disabled={disabled}
          readOnly={readOnly === true || busy}
          aria-invalid={status === "error" || undefined}
          aria-describedby={[ids.describedBy, statusId]
            .filter(Boolean)
            .join(" ")}
          data-bt-part="input"
          onFocus={(event) => {
            onFocus?.(event);
            setFocused(true);
            readCaret(event.currentTarget);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            setFocused(false);
          }}
          onSelect={(event) => {
            onSelect?.(event);
            readCaret(event.currentTarget);
          }}
          onChange={(event) => {
            onChange?.(event);
            accept(event.target.value.replace(/\D/g, "").slice(0, length));
            readCaret(event.target);
          }}
          onPaste={(event) => {
            onPaste?.(event);
            if (event.defaultPrevented || busy || readOnly === true) return;
            // Taken by hand so a code pasted with a dash or spaces isn't cut short by maxLength first.
            event.preventDefault();
            const field = event.currentTarget;
            const pasted = event.clipboardData
              .getData("text")
              .replace(/\D/g, "");
            const start = field.selectionStart ?? digits.length;
            const end = field.selectionEnd ?? start;
            const next =
              `${digits.slice(0, start)}${pasted}${digits.slice(end)}`.slice(
                0,
                length,
              );
            accept(next);
            const at = Math.min(start + pasted.length, next.length);
            requestAnimationFrame(() => {
              field.setSelectionRange(at, at);
              setCaret(at);
            });
          }}
        />
      </div>
      <p id={statusId} data-bt-part="status">
        {status === "success" ? (
          <motion.span
            data-bt-part="mark"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={pop}
          >
            <Icon icon={Check} />
          </motion.span>
        ) : status === "verifying" ? (
          <span data-bt-part="mark">
            <Spinner />
          </span>
        ) : status === "error" && hasContent(message) ? (
          <span data-bt-part="mark">
            <Icon icon={CircleAlert} />
          </span>
        ) : null}
        <span className="bt-text" data-role="caption">
          {shown ?? message}
        </span>
      </p>
      <VisuallyHidden.Root aria-live="polite">
        {status === "idle" ? "" : status === "error" ? message : shown}
      </VisuallyHidden.Root>
    </div>
  );
}
