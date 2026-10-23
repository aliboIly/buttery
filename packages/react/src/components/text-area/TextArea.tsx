import {
  cx,
  hasContent,
  useControllableState,
  useMergedRefs,
} from "@butteryui/core";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { ComponentPropsWithRef, ReactElement, ReactNode } from "react";
import {
  FormFieldCaption,
  FormFieldError,
  useFormFieldIds,
} from "../../parts/form-field/FormFieldParts.tsx";
import type {
  FormFieldSize,
  FormFieldVariant,
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
  /**
   * `"md"` (the default), 14px text on 22px lines; `"sm"`, 14px text on 20px lines, one line 28px tall
   * (`--bt-h-sm`), for a dense panel; or `"lg"`, 16px text on 24px lines, one line as tall as `--bt-h-cta`, beside
   * large fields.
   */
  readonly size?: FormFieldSize | undefined;
  /**
   * `"outline"` (the default), a 1px `control-border` edge on `bg-surface`, or `"soft"`, a `bg-control` fill whose
   * edge shows only on hover and while it has focus.
   */
  readonly variant?: FormFieldVariant | undefined;
  /**
   * Whether a new error is read out as it appears. Defaults to `true`; turn it off when an error summary
   * that takes focus reads the errors instead.
   */
  readonly announceError?: boolean | undefined;
}

/**
 * A labelled box for longer text, such as a note or a description, outlined or soft at `sm`, `md` or `lg`. It
 * grows with what's typed from `rows` lines up to `maxRows`, then scrolls inside itself, and fits again when
 * its width changes. It never animates its height.
 *
 * @example
 * <TextArea label="Note" hint="Printed on the packing slip" value={note} onValueChange={setNote} />
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
  size = "md",
  variant = "outline",
  announceError = true,
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

  const fit = useRef<() => void>(() => undefined);
  const measure = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const fitHeight = (): void => {
      const node = element.current;
      const copy = measure.current;
      if (!node || !copy) return;
      copy.value = node.value;
      const computed = getComputedStyle(node);
      const line = Number.parseFloat(computed.lineHeight);
      const frame =
        Number.parseFloat(computed.paddingTop) +
        Number.parseFloat(computed.paddingBottom);
      const tallest = line * maxRows + frame;
      const wanted = Math.max(copy.scrollHeight, line * rows + frame);
      node.style.height = `${String(Math.min(wanted, tallest))}px`;
      node.style.overflowY = wanted > tallest ? "auto" : "hidden";
    };
    fit.current = fitHeight;
    fitHeight();
  }, [current, rows, maxRows, size]);

  useEffect(() => {
    const copy = measure.current;
    if (!copy) return undefined;
    const start = copy.getBoundingClientRect();
    let width = start.width;
    let height = start.height;
    let live = true;
    // The copy is no taller than its padding, which a large box takes from the density, so its border box changes with both.
    const observer = new ResizeObserver(([entry]) => {
      const size = entry?.borderBoxSize[0];
      if (!size || (size.inlineSize === width && size.blockSize === height))
        return;
      width = size.inlineSize;
      height = size.blockSize;
      fit.current();
    });
    observer.observe(copy, { box: "border-box" });
    if ("fonts" in document) {
      void document.fonts.ready.then(() => {
        if (live) fit.current();
      });
    }
    return () => {
      live = false;
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={cx("bt-text-area bt-form-field", className)}
      style={style}
      data-bt="TextArea"
      data-size={size}
      data-variant={variant}
      data-invalid={invalid ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
    >
      <FormFieldCaption
        htmlFor={ids.control}
        label={label}
        hint={hint}
        hintId={ids.hint}
      />
      <div
        className="bt-form-field-box"
        data-bt-part="box"
        data-size={size}
        data-variant={variant}
        data-invalid={invalid ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
      >
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
        <textarea
          ref={measure}
          rows={1}
          wrap={rest.wrap}
          dir={rest.dir}
          lang={rest.lang}
          tabIndex={-1}
          readOnly
          inert
          aria-hidden="true"
          data-bt-part="measure"
        />
      </div>
      <FormFieldError id={ids.error} name={label} announce={announceError}>
        {error}
      </FormFieldError>
    </div>
  );
}
