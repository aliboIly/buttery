import { cx, useControllableState } from "@buttery/core";
import { useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import { useMergedRefs } from "@buttery/core";
import {
  FormFieldCaption,
  FormFieldError,
  hasContent,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";

/** Props for `TextArea`. `ref`, `id` and other textarea props go to the textarea; `className` and `style` to the field. */
export interface TextAreaProps extends Omit<
  ComponentPropsWithRef<"textarea">,
  "value" | "defaultValue" | "children" | "rows"
> {
  /** What the field asks for, shown above it. */
  readonly label: string;
  /** A hint under the label. */
  readonly hint?: ReactNode;
  /** What's wrong, shown under the field and read with it. Leave it out while nothing is. */
  readonly error?: ReactNode;
  /** The text. Pair with `onValueChange` or `onChange` to control it. */
  readonly value?: string | undefined;
  /** The starting text when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the text on every change. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** The lines it shows when it's empty. Defaults to 3. */
  readonly rows?: number | undefined;
  /** The most lines it grows to before it scrolls. Defaults to 8. */
  readonly maxRows?: number | undefined;
}

/**
 * A labelled box for longer text, such as a note or a description. It grows with what's typed from `rows`
 * lines up to `maxRows`, then scrolls inside itself. It never animates its height.
 *
 * @example
 * <TextArea label="Note" hint="Shown under the card" value={note} onValueChange={setNote} />
 */
export function TextArea({
  label,
  hint,
  error,
  value,
  defaultValue,
  onValueChange,
  onChange,
  rows = 3,
  maxRows = 8,
  id,
  className,
  style,
  disabled,
  ref,
  "aria-describedby": describedBy,
  ...rest
}: TextAreaProps): ReactElement {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const element = useRef<HTMLTextAreaElement>(null);
  const refs = useMergedRefs(ref, element);
  const invalid = hasContent(error);
  const ids = useFormFieldIds({
    id,
    describedBy,
    hint: hasContent(hint),
    error: invalid,
  });

  useLayoutEffect(() => {
    const node = element.current;
    if (!node) return;
    const style = getComputedStyle(node);
    const line = Number.parseFloat(style.lineHeight);
    const frame =
      Number.parseFloat(style.paddingTop) +
      Number.parseFloat(style.paddingBottom);
    node.style.height = "auto";
    const tallest = line * maxRows + frame;
    const wanted = Math.max(node.scrollHeight, line * rows + frame);
    node.style.height = `${String(Math.min(wanted, tallest))}px`;
    node.style.overflowY = wanted > tallest ? "auto" : "hidden";
  }, [current, rows, maxRows]);

  return (
    <div
      className={cx("bt-text-area bt-form-field", className)}
      style={style}
      data-bt="TextArea"
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <FormFieldCaption
        htmlFor={ids.control}
        label={label}
        hint={hint}
        hintId={ids.hint}
      />
      <div data-bt-part="box">
        <textarea
          {...rest}
          ref={refs}
          id={ids.control}
          rows={rows}
          value={current}
          disabled={disabled}
          aria-describedby={ids.describedBy}
          aria-invalid={invalid || undefined}
          onChange={(event) => {
            onChange?.(event);
            setCurrent(event.target.value);
          }}
          className="bt-scroll-fade"
          data-bt-part="input"
        />
      </div>
      <FormFieldError id={ids.error}>{error}</FormFieldError>
    </div>
  );
}
