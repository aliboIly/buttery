import { Icon } from "@buttery/core";
import { CircleAlert } from "lucide-react";
import { useId } from "react";
import type { ReactElement, ReactNode } from "react";

/** The ids that tie a field's label, hint and error to its control. */
export interface FormFieldIds {
  /** The control's id, for the label's `htmlFor`. */
  readonly control: string;
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
    hint,
    error,
    describedBy: describedBy === "" ? undefined : describedBy,
  };
}

/** Whether a hint or an error has something to show. */
export function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== "";
}

/** A field's label and, under it, its hint. */
export function FormFieldCaption({
  htmlFor,
  label,
  hint,
  hintId,
}: {
  readonly htmlFor: string;
  readonly label: string;
  readonly hint: ReactNode;
  readonly hintId: string;
}): ReactElement {
  return (
    <div data-bt-part="caption">
      <label
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

/** A field's error, under its control, with an icon so it doesn't rest on color alone. */
export function FormFieldError({
  id,
  children,
}: {
  readonly id: string;
  readonly children: ReactNode;
}): ReactElement | null {
  if (!hasContent(children)) return null;
  return (
    <p id={id} data-bt-part="error">
      <Icon icon={CircleAlert} />
      <span className="bt-text" data-role="caption">
        {children}
      </span>
    </p>
  );
}
