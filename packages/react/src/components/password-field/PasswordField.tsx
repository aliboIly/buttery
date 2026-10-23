import { Icon, useMergedRefs } from "@butteryui/core";
import { Check, Circle, Eye, EyeOff } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactElement } from "react";
import { IconButton } from "../icon-button/IconButton.tsx";
import { TextFieldShell } from "../text-field/TextField.tsx";
import type { TextFieldProps } from "../text-field/TextField.tsx";

/** One rule a password has to meet, and whether it does yet. */
export interface PasswordRequirement {
  /** The rule, such as `"At least 8 characters"`. */
  readonly label: string;
  /** Whether the password meets it now. */
  readonly met: boolean;
}

/** Props for `PasswordField`. `ref`, `id` and other input props go to the input. */
export interface PasswordFieldProps extends Omit<
  TextFieldProps,
  "type" | "iconEnd"
> {
  /** What the button that shows the password is called. Defaults to `"Show password"`. */
  readonly revealLabel?: string | undefined;
  /** Rules the password has to meet, listed under the field with a tick beside each one it meets. */
  readonly requirements?: readonly PasswordRequirement[] | undefined;
  /** What a met rule is called for screen readers. Defaults to `"Met"`. */
  readonly metLabel?: string | undefined;
  /** What a rule not met yet is called for screen readers. Defaults to `"Not met"`. */
  readonly unmetLabel?: string | undefined;
}

/**
 * A labelled password box with a button that shows or hides what's typed, and optional requirements
 * under it. It fills in a saved password by default; pass `autoComplete="new-password"` on sign-up and
 * password-change forms. A shown password is never corrected, capitalized or spell-checked, and it hides
 * again when its form is submitted, so the browser can offer to save it.
 *
 * @example
 * <PasswordField label="Password" value={password} onValueChange={setPassword} error={passwordError} />
 */
export function PasswordField({
  revealLabel = "Show password",
  requirements,
  metLabel = "Met",
  unmetLabel = "Not met",
  autoComplete,
  ref,
  ...rest
}: PasswordFieldProps): ReactElement {
  const [visible, setVisible] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const refs = useMergedRefs(ref, input);
  const requirementsId = useId();
  const listed = requirements !== undefined && requirements.length > 0;

  useEffect(() => {
    const hide = (event: SubmitEvent): void => {
      const form = input.current?.form;
      if (form && event.target === form) setVisible(false);
    };
    document.addEventListener("submit", hide, true);
    return () => {
      document.removeEventListener("submit", hide, true);
    };
  }, []);

  return (
    <TextFieldShell
      {...rest}
      ref={refs}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete ?? "current-password"}
      spellCheck={false}
      autoCapitalize="none"
      autoCorrect="off"
      root={{ className: "bt-password-field", "data-bt": "PasswordField" }}
      afterId={listed ? requirementsId : undefined}
      end={
        <IconButton
          icon={visible ? EyeOff : Eye}
          label={revealLabel}
          size="sm"
          aria-pressed={visible}
          disabled={rest.disabled}
          onClick={() => {
            setVisible((shown) => !shown);
          }}
        />
      }
      after={
        listed ? (
          <ul id={requirementsId} data-bt-part="requirements">
            {requirements.map((requirement) => (
              <li
                key={requirement.label}
                data-met={requirement.met ? "" : undefined}
              >
                {requirement.met ? (
                  <Icon icon={Check} label={metLabel} />
                ) : (
                  <Icon icon={Circle} label={unmetLabel} />
                )}
                <span className="bt-text" data-role="caption">
                  {requirement.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  );
}
