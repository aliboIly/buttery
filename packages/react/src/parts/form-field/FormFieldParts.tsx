import { Icon, hasContent, timing } from "@buttery/core";
import { CircleAlert } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { isValidElement, useEffect, useId, useState } from "react";
import type { ReactElement, ReactNode } from "react";

/** The ids that tie a field's label, hint and error to its control. */
export interface FormFieldIds {
  /** The control's id, for the label's `htmlFor`. */
  readonly control: string;
  /** The label's id, for controls a `<label>` can't name. */
  readonly label: string;
  /** The hint's id. */
  readonly hint: string;
  /** The error's id. */
  readonly error: string;
  /** What describes the control: its own `aria-describedby`, then the hint and the error while they show. */
  readonly describedBy: string | undefined;
}

/** What a field shows besides its control, and the control's own id and description, if it has them. */
export interface FormFieldShown {
  /** The control's id from its props. */
  readonly id: string | undefined;
  /** The control's own `aria-describedby`, kept ahead of the field's. */
  readonly describedBy: string | undefined;
  /** Whether a hint shows. */
  readonly hint: boolean;
  /** Whether an error shows. */
  readonly error: boolean;
}

/** Ids for a field: the control's own id if it has one, and ids for its hint and error. */
export function useFormFieldIds(shown: FormFieldShown): FormFieldIds {
  const base = useId();
  const hint = `${base}hint`;
  const error = `${base}error`;
  const describedBy = [
    shown.describedBy,
    shown.hint ? hint : undefined,
    shown.error ? error : undefined,
  ]
    .filter((part) => part !== undefined && part !== "")
    .join(" ");
  return {
    control: shown.id ?? `${base}control`,
    label: `${base}label`,
    hint,
    error,
    describedBy: describedBy === "" ? undefined : describedBy,
  };
}

/** Props for `FormFieldCaption`. */
export interface FormFieldCaptionProps {
  /** The id of the control the label names, for its `htmlFor`. */
  readonly htmlFor: string;
  /** The label's own id, for a control named through `aria-labelledby`. */
  readonly labelId?: string | undefined;
  /** What the control asks for. */
  readonly label: string;
  /** A hint under the label, or nothing. */
  readonly hint: ReactNode;
  /** The hint's id, for the control's `aria-describedby`. */
  readonly hintId: string;
}

/** A field's label and, under it, its hint: the top of every buttery field, for a field of your own. */
export function FormFieldCaption({
  htmlFor,
  labelId,
  label,
  hint,
  hintId,
}: FormFieldCaptionProps): ReactElement {
  return (
    <div data-bt-part="caption">
      <label
        id={labelId}
        htmlFor={htmlFor}
        className="bt-text"
        data-role="label"
        data-bt-part="label"
      >
        {label}
      </label>
      {hasContent(hint) ? (
        <p
          id={hintId}
          className="bt-text"
          data-role="caption"
          data-bt-part="hint"
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** The words in a node: its strings and numbers, and those of the elements in it, in order. */
function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ readonly children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

/** Props for `FormFieldError`. */
export interface FormFieldErrorProps {
  /** The error's id, for the control's `aria-describedby`. */
  readonly id: string;
  /** The field's name, read before a new error ("Email: Enter an email address"). */
  readonly name: string | undefined;
  /** Whether a new error is read out as it appears; off when an error summary that takes focus reads it. */
  readonly announce: boolean;
  /** What's wrong, or nothing while nothing is. */
  readonly children: ReactNode;
}

/**
 * A field's error, under its control, with an icon so it doesn't rest on color alone. It describes the
 * control, and a new error's words are also read out politely as it appears, with the field's name, so an
 * error shown on a field that was just left is heard. The live region empties again after a moment, so
 * reading the page later finds the error once.
 */
export function FormFieldError({
  id,
  name,
  announce,
  children,
}: FormFieldErrorProps): ReactElement {
  const shown = hasContent(children);
  const text = shown ? textOf(children) : "";
  const words =
    !announce || text === ""
      ? ""
      : name === undefined
        ? text
        : `${name}: ${text}`;
  const [heard, setHeard] = useState("");

  useEffect(() => {
    if (words === heard) return undefined;
    const timer = window.setTimeout(
      () => {
        setHeard(words);
      },
      words === "" ? 0 : timing["announcement-life"],
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [words, heard]);

  return (
    <>
      {announce ? (
        <VisuallyHidden.Root aria-live="polite">
          {words === heard ? "" : words}
        </VisuallyHidden.Root>
      ) : null}
      {shown ? (
        <p id={id} data-bt-part="error">
          <Icon icon={CircleAlert} />
          <span className="bt-text" data-role="caption">
            {children}
          </span>
        </p>
      ) : null}
    </>
  );
}
