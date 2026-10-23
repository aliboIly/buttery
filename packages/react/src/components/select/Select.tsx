import {
  Icon,
  Popover,
  cx,
  timing,
  useControllableState,
  useMergedRefs,
} from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import { ChevronDown } from "lucide-react";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type {
  ComponentPropsWithRef,
  KeyboardEvent,
  ReactElement,
  ReactNode,
} from "react";
import { Button } from "../button/Button.tsx";

/** One choice in a `Select`. */
export interface SelectOption<Value extends string = string> {
  /** What choosing it sets the select's value to. */
  readonly value: Value;
  /** What the list and, once chosen, the trigger show. */
  readonly label: string;
  /** Keeps it from being chosen; arrow keys skip it. */
  readonly disabled?: boolean | undefined;
}

/** Props for `Select`. `ref` and other button props go to the trigger. */
export interface SelectProps<Value extends string = string> extends Omit<
  ComponentPropsWithRef<"button">,
  "value" | "defaultValue" | "onChange" | "children"
> {
  /** What the value is, such as "Canvas shape". It names the trigger, the list and the footer. */
  readonly label: string;
  /** The choices, in order. */
  readonly options: readonly SelectOption<Value>[];
  /** The chosen value. Pair with `onValueChange` to control it. */
  readonly value?: Value | undefined;
  /** The value chosen at first when uncontrolled. */
  readonly defaultValue?: Value | undefined;
  /** Called with the value of the option chosen. */
  readonly onValueChange?: ((value: Value) => void) | undefined;
  /** Whether the list is open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether the list starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when the list opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** What the trigger shows instead of the chosen option's label, such as a custom size from the footer. */
  readonly valueLabel?: string | undefined;
  /** What the trigger shows while nothing is chosen. Defaults to `"Choose"`. */
  readonly placeholder?: string | undefined;
  /** Controls under the list, such as width and height fields for a custom value. */
  readonly footer?: ReactNode;
  /** Names the footer for screen readers. Defaults to `label`. */
  readonly footerLabel?: string | undefined;
  /** Which edge of the trigger the list lines up with. Defaults to `"end"`, or `"start"` for `"outline"`. */
  readonly align?: "start" | "center" | "end" | undefined;
  /**
   * How the trigger looks: `"ghost"` (the default), a pill for header bars and toolbars, or `"outline"`, a
   * box like a text field's that fills its column, for forms. An outline list is at least as wide as its box.
   */
  readonly variant?: "ghost" | "outline" | undefined;
  /** The trigger's height: `"sm"` (28px) or `"md"` (36px as a pill, 34px as a box). Defaults to `"md"`. */
  readonly size?: "sm" | "md" | undefined;
}

function Check(props: IconComponentProps): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * A ghost pill showing the chosen value, or with `variant="outline"` a box like a text field's for forms;
 * it opens a list to pick another, lined up with its end (its start as a box), and an optional footer for
 * a custom value, such as width and height fields. Inside a `Field`, spread the field's props onto it and
 * the field's label names it, followed by the chosen value. The open list moves like a menu:
 * arrow keys, Home and End move, typing jumps to an option, Enter or Space chooses, Escape closes, and
 * focus goes back to the trigger. The arrow keys also open it from the trigger. With a footer, Tab moves
 * between the list and the footer's controls.
 *
 * @example
 * <Select
 *   label="Canvas shape"
 *   value={shape}
 *   onValueChange={setShape}
 *   options={[{ value: "16:9", label: "16:9" }, { value: "1:1", label: "1:1" }]}
 * />
 */
export function Select<Value extends string = string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  valueLabel,
  placeholder = "Choose",
  footer,
  footerLabel,
  align,
  variant = "ghost",
  size = "md",
  className,
  disabled,
  onKeyDown,
  "aria-labelledby": labelledBy,
  ref,
  ...rest
}: SelectProps<Value>): ReactElement {
  const [current, setCurrent] = useControllableState<Value | undefined>({
    value,
    defaultValue,
    onChange: (next) => {
      if (next !== undefined) onValueChange?.(next);
    },
  });
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLButtonElement>(null);
  const triggerRefs = useMergedRefs(ref, trigger);
  const panel = useRef<HTMLDivElement>(null);
  const typed = useRef({ text: "", at: 0 });
  const listId = useId();
  const valueId = useId();
  const selected = options.find((option) => option.value === current);
  const shown = valueLabel ?? selected?.label ?? placeholder;
  const enabled = options.filter((option) => option.disabled !== true);
  const resting =
    selected === undefined || selected.disabled === true
      ? enabled[0]
      : selected;
  const [active, setActive] = useState<Value | undefined>(undefined);
  const focused = active ?? resting?.value;

  const optionElement = (option: SelectOption<Value>): HTMLElement | null =>
    panel.current?.querySelector<HTMLElement>(
      `[role="option"][data-value="${CSS.escape(option.value)}"]`,
    ) ?? null;
  const focusOption = (option: SelectOption<Value> | undefined): void => {
    if (!option) return;
    flushSync(() => {
      setActive(option.value);
    });
    optionElement(option)?.focus();
  };
  const choose = (option: SelectOption<Value>): void => {
    if (option.disabled === true) return;
    trigger.current?.focus();
    setCurrent(option.value);
    setOpen(false);
  };

  const moveFrom = (option: SelectOption<Value>, key: string): void => {
    const at = enabled.indexOf(option);
    if (key === "ArrowDown")
      focusOption(enabled[Math.min(at + 1, enabled.length - 1)]);
    else if (key === "ArrowUp") focusOption(enabled[Math.max(at - 1, 0)]);
    else if (key === "Home") focusOption(enabled[0]);
    else if (key === "End") focusOption(enabled.at(-1));
  };

  const searching = (now: number): boolean =>
    typed.current.text !== "" && now - typed.current.at <= timing.typeahead;

  /**
   * Moves to the option the typed letters start: one letter, or the same one again, moves on to the next
   * option starting with it, and more letters keep the current option while it still matches.
   */
  const typeahead = (
    option: SelectOption<Value>,
    character: string,
    now: number,
  ): void => {
    const text = searching(now) ? typed.current.text + character : character;
    typed.current = { text, at: now };
    const letter = character.toLocaleLowerCase();
    const repeated = text.toLocaleLowerCase().replaceAll(letter, "") === "";
    const search = repeated ? letter : text.toLocaleLowerCase();
    const from = enabled.indexOf(option) + (repeated ? 1 : 0);
    const ordered = [...enabled.slice(from), ...enabled.slice(0, from)];
    focusOption(
      ordered.find((candidate) =>
        candidate.label.toLocaleLowerCase().startsWith(search),
      ),
    );
  };

  const optionKeyDown =
    (option: SelectOption<Value>) =>
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        moveFrom(option, event.key);
      } else if (event.key === " " && searching(event.timeStamp)) {
        event.preventDefault();
        typeahead(option, " ", event.timeStamp);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        choose(option);
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        typeahead(option, event.key, event.timeStamp);
      }
    };

  const triggerButton = (
    <button
      {...rest}
      ref={triggerRefs}
      type="button"
      role="combobox"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listId : undefined}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          setOpen(true);
        }
      }}
      aria-label={labelledBy === undefined ? `${label}, ${shown}` : undefined}
      aria-labelledby={
        labelledBy === undefined ? undefined : `${labelledBy} ${valueId}`
      }
      className={cx("bt-select", className)}
      data-bt="Select"
      data-variant={variant}
      data-size={size}
      data-bt-control={variant === "outline" ? "" : undefined}
    >
      <span
        id={valueId}
        className="bt-truncate"
        data-bt-part="value"
        data-bt-truncate=""
        title={shown}
      >
        {shown}
      </span>
      {variant === "outline" ? (
        <Icon icon={ChevronDown} data-bt-part="chevron" />
      ) : null}
    </button>
  );

  return (
    <Popover
      open={isOpen}
      onOpenChange={(next) => {
        if (next) setActive(undefined);
        setOpen(next);
      }}
    >
      <Popover.Trigger asChild>
        {variant === "outline" ? (
          triggerButton
        ) : (
          <Button asChild variant="ghost" size={size} iconEnd={ChevronDown}>
            {triggerButton}
          </Button>
        )}
      </Popover.Trigger>
      <Popover.Content
        ref={panel}
        align={align ?? (variant === "outline" ? "start" : "end")}
        role={footer === undefined ? "none" : "dialog"}
        aria-label={footer === undefined ? undefined : label}
        className="bt-select-panel"
        data-variant={variant}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          setActive(undefined);
          if (resting) optionElement(resting)?.focus();
        }}
      >
        <div role="listbox" id={listId} aria-label={label} data-bt-part="list">
          {options.map((option) => {
            const chosen = option.value === current;
            return (
              <div
                key={option.value}
                role="option"
                tabIndex={option.value === focused ? 0 : -1}
                aria-selected={chosen}
                aria-disabled={option.disabled === true || undefined}
                data-value={option.value}
                className="bt-text"
                data-role="menu"
                data-bt-part="option"
                onClick={() => {
                  choose(option);
                }}
                onKeyDown={optionKeyDown(option)}
                onPointerMove={(event) => {
                  const list = event.currentTarget.parentElement;
                  if (
                    option.disabled !== true &&
                    document.activeElement !== event.currentTarget &&
                    list?.contains(document.activeElement) === true
                  ) {
                    focusOption(option);
                  }
                }}
              >
                <span
                  className="bt-truncate"
                  data-bt-truncate=""
                  data-bt-part="label"
                  title={option.label}
                >
                  {option.label}
                </span>
                <span data-bt-part="check">
                  {chosen ? <Icon icon={Check} /> : null}
                </span>
              </div>
            );
          })}
        </div>
        {footer === undefined ? null : (
          <>
            <div data-bt-part="separator" aria-hidden="true" />
            <div
              role="group"
              aria-label={footerLabel ?? label}
              data-bt-part="footer"
            >
              {footer}
            </div>
          </>
        )}
      </Popover.Content>
    </Popover>
  );
}
