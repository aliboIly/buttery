import {
  Icon,
  Kbd,
  ariaKeyShortcuts,
  cx,
  shortcutKeys,
  useApplePlatform,
  useControllableState,
  useMergedRefs,
  useShortcut,
} from "@butteryui/core";
import type { Shortcut } from "@butteryui/core";
import { Search, X } from "lucide-react";
import { useRef } from "react";
import type { ComponentPropsWithRef, ReactElement } from "react";
import { IconButton } from "../icon-button/IconButton.tsx";

/** Props for `SearchField`. `ref` and other input props go to the input; `className` and `style` to the field. */
export interface SearchFieldProps extends Omit<
  ComponentPropsWithRef<"input">,
  "size" | "value" | "defaultValue" | "children" | "type"
> {
  /** Names the field for screen readers, and shows as its placeholder unless there's one. Defaults to `"Search"`. */
  readonly label?: string | undefined;
  /** The text. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The starting text when uncontrolled. */
  readonly defaultValue?: string | undefined;
  /** Called with the text on every change, and with `""` when it's cleared. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** `"outline"` (the default) with a 1px edge, as in a table's toolbar, or `"soft"` on `bg-control` with none, as in a top bar. */
  readonly variant?: "outline" | "soft" | undefined;
  /** A key that focuses the field from anywhere outside a text field, written as `useShortcut` takes it, such as `"/"`. It shows while the field is empty. */
  readonly shortcut?: Shortcut | undefined;
  /** Names the clear button. Defaults to `"Clear search"`. */
  readonly clearLabel?: string | undefined;
}

/**
 * A field for finding things: 34px tall, a 16px search icon at its start and, once it holds text, a clear
 * button at its end (Escape clears it too, keeping focus). While it's empty it can show a shortcut, such as
 * `/`, that focuses it from anywhere. `soft` sits on `bg-control` with no edge, for a top bar; `outline` has
 * the field's 1px edge, for a toolbar over a table.
 *
 * @example
 * <SearchField variant="soft" shortcut="/" value={query} onValueChange={setQuery} />
 */
export function SearchField({
  label = "Search",
  value,
  defaultValue,
  onValueChange,
  variant = "outline",
  shortcut,
  clearLabel = "Clear search",
  placeholder,
  className,
  style,
  ref,
  onChange,
  onKeyDown,
  disabled,
  ...rest
}: SearchFieldProps): ReactElement {
  const [current, setCurrent] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  const input = useRef<HTMLInputElement>(null);
  const refs = useMergedRefs(ref, input);
  const apple = useApplePlatform();
  useShortcut(
    shortcut ?? "",
    (event) => {
      event.preventDefault();
      input.current?.focus();
    },
    { enabled: shortcut !== undefined && disabled !== true },
  );
  const clear = (): void => {
    setCurrent("");
    input.current?.focus();
  };
  return (
    <div
      className={cx("bt-search-field", className)}
      style={style}
      data-bt="SearchField"
      data-variant={variant}
      data-disabled={disabled ? "" : undefined}
      data-bt-control=""
    >
      <span data-bt-part="icon">
        <Icon icon={Search} />
      </span>
      <input
        {...rest}
        ref={refs}
        type="search"
        aria-label={label}
        aria-keyshortcuts={
          shortcut === undefined ? undefined : ariaKeyShortcuts(shortcut, apple)
        }
        placeholder={placeholder ?? label}
        value={current}
        disabled={disabled}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          onChange?.(event);
          setCurrent(event.target.value);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (
            event.defaultPrevented ||
            event.key !== "Escape" ||
            current === ""
          )
            return;
          event.preventDefault();
          setCurrent("");
        }}
        data-bt-part="input"
      />
      {current === "" ? (
        shortcut === undefined ? null : (
          <Kbd
            keys={shortcutKeys(shortcut)}
            aria-hidden="true"
            data-bt-part="shortcut"
          />
        )
      ) : (
        <span data-bt-part="end">
          <IconButton
            icon={X}
            label={clearLabel}
            size="sm"
            disabled={disabled}
            onClick={clear}
          />
        </span>
      )}
    </div>
  );
}
