import {
  Icon,
  Morph,
  cx,
  hasContent,
  useAnimationTracking,
  useButteryTransition,
  useControllableState,
  useMotionPreference,
} from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { Accordion as RadixAccordion } from "radix-ui";
import { createContext, use, useId } from "react";
import type {
  ComponentPropsWithRef,
  ComponentType,
  Context,
  ReactElement,
  ReactNode,
} from "react";

/**
 * How an accordion draws its items: `"divided"` rows with a hairline between them, `"contained"` rows in one
 * card, `"cards"` with a card for each item, or `"plain"` rows that tint on hover.
 */
export type AccordionVariant = "divided" | "contained" | "cards" | "plain";

/** How big an accordion's rows are: `"sm"`, `"md"` or `"lg"`. */
export type AccordionSize = "sm" | "md" | "lg";

/** The heading level an accordion's triggers sit in: `2` to `6`. */
export type AccordionHeadingLevel = 2 | 3 | 4 | 5 | 6;

const HEADINGS = {
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const satisfies Record<AccordionHeadingLevel, string>;

interface AccordionState {
  readonly open: readonly string[];
  readonly headingLevel: AccordionHeadingLevel;
}

const AccordionContext: Context<AccordionState | null> =
  createContext<AccordionState | null>(null);

function useAccordion(part: string): AccordionState {
  const accordion = use(AccordionContext);
  if (!accordion) {
    throw new Error(
      `[buttery:Accordion] Accordion.${part} has to be inside <Accordion>. Fix: <Accordion><Accordion.Item value="…" title="…">…</Accordion.Item></Accordion>`,
    );
  }
  return accordion;
}

/** The props every `Accordion` takes, one item open at a time or several. */
export interface AccordionBaseProps extends Omit<
  ComponentPropsWithRef<"div">,
  "defaultValue" | "dir"
> {
  /**
   * How the items are drawn: `"divided"` (the default), rows with a hairline between them; `"contained"`, rows
   * in one card; `"cards"`, a card for each item, 8px apart; or `"plain"`, rows that tint on hover.
   */
  readonly variant?: AccordionVariant | undefined;
  /**
   * How big the rows are: `"sm"` (14px titles, 12px above and below), `"md"` (the default: 15px titles, 16px
   * above and below) or `"lg"` (18px titles, 20px above and below).
   */
  readonly size?: AccordionSize | undefined;
  /** Keeps every item from opening or closing. */
  readonly disabled?: boolean | undefined;
  /** The heading level each trigger sits in, one below the heading over the accordion. Defaults to `3`. */
  readonly headingLevel?: AccordionHeadingLevel | undefined;
  /** The items: `Accordion.Item`s, as direct children. */
  readonly children?: ReactNode;
}

/** Props for `Accordion` with one item open at a time, the default. */
export interface AccordionSingleProps extends AccordionBaseProps {
  /** `"single"` (the default) keeps one item open at a time; opening another closes it. */
  readonly type?: "single" | undefined;
  /** The open item's value, or `""` while none is. Pair with `onValueChange` to control it. */
  readonly value?: string | undefined;
  /** The item open at first when uncontrolled. Defaults to none. */
  readonly defaultValue?: string | undefined;
  /** Called with the value of the item that opens, or `""` when the open one closes. */
  readonly onValueChange?: ((value: string) => void) | undefined;
  /** Whether pressing the open item's trigger closes it. Defaults to `true`. */
  readonly collapsible?: boolean | undefined;
}

/** Props for `Accordion` with `type="multiple"`, where any number of items stay open. */
export interface AccordionMultipleProps extends AccordionBaseProps {
  /** `"multiple"` lets any number of items stay open at once. */
  readonly type: "multiple";
  /** The open items' values. Pair with `onValueChange` to control them. */
  readonly value?: readonly string[] | undefined;
  /** The items open at first when uncontrolled. Defaults to none. */
  readonly defaultValue?: readonly string[] | undefined;
  /** Called with the open items' values each time one opens or closes. */
  readonly onValueChange?: ((value: readonly string[]) => void) | undefined;
}

/** Props for `Accordion`: one item open at a time (the default), or several with `type="multiple"`. */
export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

const NONE: readonly string[] = [];

function rootAttributes(
  variant: AccordionVariant,
  size: AccordionSize,
  disabled: boolean | undefined,
  className: string | undefined,
) {
  return {
    className: cx("bt-accordion", className),
    "data-bt": "Accordion",
    "data-variant": variant,
    "data-size": size,
    "data-disabled": disabled ? "" : undefined,
  };
}

function SingleAccordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  variant = "divided",
  size = "md",
  headingLevel = 3,
  disabled,
  className,
  children,
  ...rest
}: AccordionSingleProps): ReactElement {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
  });
  return (
    <AccordionContext
      value={{ open: open === "" ? NONE : [open], headingLevel }}
    >
      <RadixAccordion.Root
        {...rest}
        type={type}
        collapsible={collapsible}
        value={open}
        onValueChange={setOpen}
        disabled={disabled}
        {...rootAttributes(variant, size, disabled, className)}
      >
        {children}
      </RadixAccordion.Root>
    </AccordionContext>
  );
}

function MultipleAccordion({
  type,
  value,
  defaultValue,
  onValueChange,
  variant = "divided",
  size = "md",
  headingLevel = 3,
  disabled,
  className,
  children,
  ...rest
}: AccordionMultipleProps): ReactElement {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue: defaultValue ?? NONE,
    onChange: onValueChange,
  });
  return (
    <AccordionContext value={{ open, headingLevel }}>
      <RadixAccordion.Root
        {...rest}
        type={type}
        value={[...open]}
        onValueChange={setOpen}
        disabled={disabled}
        {...rootAttributes(variant, size, disabled, className)}
      >
        {children}
      </RadixAccordion.Root>
    </AccordionContext>
  );
}

function AccordionRoot(props: AccordionProps): ReactElement {
  return props.type === "multiple" ? (
    <MultipleAccordion {...props} />
  ) : (
    <SingleAccordion {...props} />
  );
}

/** Props for `Accordion.Item`. */
export interface AccordionItemProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** Names the item: what the accordion's `value` holds while it's open. */
  readonly value: string;
  /** The trigger's words, such as a question. They wrap onto more lines, and they name the trigger and its panel. */
  readonly title: ReactNode;
  /** A line under the title, such as where the item comes from. Screen readers hear it after the title, as part of the trigger's name. */
  readonly description?: ReactNode;
  /** An icon before the title, on the middle of its first line. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Anything else before the title, such as an `Avatar`, centered on the title and description. It takes the place of `icon`. */
  readonly leading?: ReactNode;
  /** Keeps the item from opening or closing, and takes its trigger out of the tab order. */
  readonly disabled?: boolean | undefined;
  /** The panel: what shows under the trigger while the item is open. */
  readonly children?: ReactNode;
}

/**
 * One item: a trigger row with the title, an optional icon or leading part, and a chevron, over a panel
 * that opens in place. The panel's height follows its content through `Morph` on `spring.smooth` while the
 * chevron turns over and the content fades, and the item's `id`, if it has one, is an anchor that keeps
 * clear of sticky bars.
 */
export function AccordionItem({
  value,
  title,
  description,
  icon,
  leading,
  disabled,
  className,
  children,
  ...rest
}: AccordionItemProps): ReactElement {
  const { open, headingLevel } = useAccordion("Item");
  const isOpen = open.includes(value);
  const reduced = useMotionPreference() === "reduced";
  const turn = useButteryTransition("smooth");
  const turned = isOpen ? 180 : 0;
  const tracking = useAnimationTracking();
  const titleId = useId();
  const described = hasContent(description);
  const custom = hasContent(leading);
  const Heading = HEADINGS[headingLevel];
  return (
    <RadixAccordion.Item
      {...rest}
      value={value}
      disabled={disabled}
      className={cx("bt-accordion-item", className)}
      data-bt-part="accordion-item"
    >
      <RadixAccordion.Header asChild>
        <Heading data-bt-part="accordion-heading">
          <RadixAccordion.Trigger
            className="bt-focus"
            data-bt-part="accordion-trigger"
          >
            {custom || icon ? (
              <span
                data-bt-part="accordion-leading"
                data-kind={custom ? "custom" : "icon"}
              >
                {custom ? leading : icon ? <Icon icon={icon} /> : null}
              </span>
            ) : null}
            <span data-bt-part="accordion-text">
              <span id={titleId} data-bt-part="accordion-title">
                {title}
              </span>
              {described ? (
                <span data-bt-part="accordion-description">{description}</span>
              ) : null}
            </span>
            <motion.span
              {...tracking}
              {...(reduced
                ? { style: { rotate: turned } }
                : {
                    initial: false,
                    animate: { rotate: turned },
                    transition: turn,
                  })}
              data-bt-part="accordion-chevron"
            >
              <Icon icon={ChevronDown} />
            </motion.span>
          </RadixAccordion.Trigger>
        </Heading>
      </RadixAccordion.Header>
      <Morph contentKey={isOpen ? "open" : "closed"}>
        {isOpen ? (
          <RadixAccordion.Content
            forceMount
            aria-labelledby={titleId}
            data-bt-part="accordion-panel"
          >
            {children}
          </RadixAccordion.Content>
        ) : null}
      </Morph>
    </RadixAccordion.Item>
  );
}

/** `Accordion` with its part. */
export interface AccordionComponent {
  (props: AccordionProps): ReactElement;
  /** One item: its trigger row and its panel. */
  readonly Item: typeof AccordionItem;
}

/**
 * A list of items that each open in place: a trigger row, its title wrapping onto more lines, over a panel
 * whose height follows its content on `spring.smooth` (through `Morph`, so reduced motion opens it at once)
 * while the chevron turns over. One item is open at a time unless `type="multiple"`; arrow keys move between
 * triggers, Home and End jump to the ends. `variant` draws the items as divided rows, rows in one card, a card
 * each or plain rows; `size` sets the rows' type and room.
 *
 * @example
 * <Accordion type="multiple" variant="cards">
 *   <Accordion.Item value="shipping" title="How much is shipping?">
 *     Standard shipping is $6, and free from $40.
 *   </Accordion.Item>
 *   <Accordion.Item value="returns" title="What if I don't like a coffee?">
 *     Tell us within 30 days and we'll send another or refund you.
 *   </Accordion.Item>
 * </Accordion>
 */
export const Accordion: AccordionComponent = Object.assign(AccordionRoot, {
  Item: AccordionItem,
});
