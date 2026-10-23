import {
  Icon,
  Text,
  cx,
  opensElsewhere,
  useControllableState,
} from "@butteryui/core";
import type { IconComponentProps } from "@butteryui/core";
import type {
  CSSProperties,
  ComponentType,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { Dialog } from "../../components/dialog/Dialog.tsx";
import { Arrow } from "../../parts/arrow/Arrow.tsx";

/** One way to go in a `ChoiceDialog`. */
export interface DialogChoice {
  /** Identifies the choice among the others. */
  readonly id: string;
  /** A 20px icon in its tile. */
  readonly icon: ComponentType<IconComponentProps>;
  /** What it is, such as "Wholesale order". */
  readonly title: string;
  /** A line on what it's for. */
  readonly description?: string | undefined;
  /** Makes it a link to this page. */
  readonly href?: string | undefined;
  /** Runs when it's chosen, before the dialog closes, or as its link is followed. */
  readonly onSelect?: ((event: MouseEvent<HTMLElement>) => void) | undefined;
}

/** Props for `ChoiceDialog`. */
export interface ChoiceDialogProps {
  /** The dialog's content box. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The button that opens it. */
  readonly trigger?: ReactElement | undefined;
  /** Whether it's open, when you control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The question, which names the dialog. */
  readonly title: string;
  /** A line under the title, which describes it. */
  readonly description?: ReactNode;
  /** The ways to go, 8px apart. */
  readonly choices: readonly DialogChoice[];
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the content inside the dialog, the element that carries `data-bt="ChoiceDialog"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
}

function ChoiceBody({
  choice,
}: {
  readonly choice: DialogChoice;
}): ReactElement {
  return (
    <>
      <span data-bt-part="tile">
        <Icon icon={choice.icon} size="md" />
      </span>
      <span data-bt-part="text">
        <Text>{choice.title}</Text>
        {choice.description === undefined ? null : (
          <Text variant="body-sm" asChild>
            <span>{choice.description}</span>
          </Text>
        )}
      </span>
      <Arrow direction="forward" />
    </>
  );
}

/**
 * A dialog that offers a few ways to go, such as kinds of order to create: its title and a line, then a
 * row per choice, 8px apart, each with an icon tile, a title over a line and an arrow that draws its stem
 * on hover. A row is a link with an `href` or a button without; choosing one closes the dialog.
 *
 * @example
 * <ChoiceDialog
 *   trigger={<Button variant="primary">New order</Button>}
 *   title="What kind of order?"
 *   choices={[
 *     { id: "retail", icon: ShoppingBag, title: "Retail order", description: "One customer, shipped to them.", href: "/orders/new" },
 *     { id: "wholesale", icon: Store, title: "Wholesale order", description: "Cases for a café, invoiced.", href: "/orders/new-wholesale" },
 *   ]}
 * />
 */
export function ChoiceDialog({
  ref,
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  description,
  choices,
  closeLabel,
  className,
  style,
}: ChoiceDialogProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  // Choosing closes the dialog even when the choice's handler prevents the default, as a router's link does.
  // Only a link opened elsewhere, in a new tab or window, leaves it open.
  const choose =
    (choice: DialogChoice) =>
    (event: MouseEvent<HTMLElement>): void => {
      choice.onSelect?.(event);
      if (choice.href === undefined || !opensElsewhere(event)) setOpen(false);
    };
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content size="md" ref={ref} closeLabel={closeLabel}>
        <div
          className={cx("bt-choice-dialog", className)}
          style={style}
          data-bt="ChoiceDialog"
        >
          <Dialog.Text title={title} body={description} />
          <Dialog.Body>
            <ul data-bt-part="choices">
              {choices.map((choice) => (
                <li key={choice.id}>
                  {choice.href === undefined ? (
                    <button
                      type="button"
                      onClick={choose(choice)}
                      className="bt-focus"
                      data-bt-part="choice"
                      data-arrow="forward"
                    >
                      <ChoiceBody choice={choice} />
                    </button>
                  ) : (
                    <a
                      href={choice.href}
                      onClick={choose(choice)}
                      className="bt-focus"
                      data-bt-part="choice"
                      data-arrow="forward"
                    >
                      <ChoiceBody choice={choice} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </Dialog.Body>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
