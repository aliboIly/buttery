import { useControllableState, useMergedRefs } from "@butteryui/core";
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import {
  formatIdentifier,
  identifierKind,
  validIdentifier,
} from "../../patterns/auth-flow/identifier.ts";
import { TextFieldShell } from "../text-field/TextField.tsx";
import type { TextFieldProps } from "../text-field/TextField.tsx";

/** Props for `IdentifierField`. `ref`, `id` and other input props go to the input; `className` and `style` to the field. */
export interface IdentifierFieldProps extends Omit<
  TextFieldProps,
  | "label"
  | "type"
  | "inputMode"
  | "autoComplete"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "size"
> {
  /** What the field asks for. Defaults to `"Email or phone number"`. */
  readonly label?: string | undefined;
  /** The text, a phone number as formatted. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The starting text when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the text on every change, a phone number formatted as it's shown. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Offers saved passkeys too, with `autocomplete="username webauthn"`. Defaults to `false`. */
  readonly passkey?: boolean | undefined;
  /** What's wrong, from outside the field, such as a code that couldn't be sent. Shown in place of its own message. */
  readonly error?: ReactNode;
  /** What it says once it's left with something that isn't an email address or a phone number. */
  readonly invalidMessage?: string | undefined;
}

const INVALID =
  "Enter an email address or a phone number, such as name@example.com or (503) 555-0142.";

/**
 * One field for an email address or a phone number. It tells them apart as they're typed, asks phones for
 * the matching keyboard and browsers for the matching autofill, and formats a North American number as it
 * goes without moving the caret; an email stays as written. It says what's wrong only once it's left, never
 * while it's being typed in.
 *
 * @example
 * <IdentifierField value={identifier} onValueChange={setIdentifier} error={requestError} />
 */
export function IdentifierField({
  label = "Email or phone number",
  value,
  defaultValue,
  onValueChange,
  passkey = false,
  error,
  invalidMessage = INVALID,
  className,
  ref,
  onChange,
  onBlur,
  ...rest
}: IdentifierFieldProps): ReactElement {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const [left, setLeft] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const refs = useMergedRefs(ref, input);
  const caret = useRef<number | null>(null);
  const kind = identifierKind(current);
  const shown =
    error ??
    (left && current.trim() !== "" && !validIdentifier(current)
      ? invalidMessage
      : undefined);

  useLayoutEffect(() => {
    const element = input.current;
    if (caret.current === null || element === null) return;
    if (document.activeElement === element) {
      element.setSelectionRange(caret.current, caret.current);
    }
    caret.current = null;
  });

  return (
    <TextFieldShell
      {...rest}
      root={{ className: "bt-identifier-field", "data-bt": "IdentifierField" }}
      ref={refs}
      className={className}
      data-kind={kind}
      label={label}
      size="lg"
      type="text"
      inputMode={kind === "phone" ? "tel" : kind === "email" ? "email" : "text"}
      autoComplete={
        passkey
          ? "username webauthn"
          : kind === "phone"
            ? "tel"
            : kind === "email"
              ? "email"
              : "username"
      }
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      value={current}
      error={shown}
      onChange={(event) => {
        onChange?.(event);
        const target = event.currentTarget;
        const next = formatIdentifier({
          value: target.value,
          caret: target.selectionStart ?? target.value.length,
        });
        caret.current = next.caret;
        setLeft(false);
        setCurrent(next.value);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        setLeft(true);
      }}
    />
  );
}
