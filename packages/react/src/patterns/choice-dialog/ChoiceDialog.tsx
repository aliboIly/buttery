import { Icon, Text, cx } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import type {
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
  /** Classes for the content inside the dialog. */
  readonly className?: string | undefined;
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
}: ChoiceDialogProps): ReactElement {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content size="md" ref={ref} closeLabel={closeLabel}>
        <div
          className={cx("bt-choice-dialog", className)}
          data-bt="ChoiceDialog"
        >
          <Dialog.Text title={title} body={description} />
          <Dialog.Body>
            <ul data-bt-part="choices">
              {choices.map((choice) => (
                <li key={choice.id}>
                  <Dialog.Close asChild>
                    {choice.href === undefined ? (
                      <button
                        type="button"
                        onClick={choice.onSelect}
                        className="bt-focus"
                        data-bt-part="choice"
                        data-arrow="forward"
                      >
                        <ChoiceBody choice={choice} />
                      </button>
                    ) : (
                      <a
                        href={choice.href}
                        onClick={choice.onSelect}
                        className="bt-focus"
                        data-bt-part="choice"
                        data-arrow="forward"
                      >
                        <ChoiceBody choice={choice} />
                      </a>
                    )}
                  </Dialog.Close>
                </li>
              ))}
            </ul>
          </Dialog.Body>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
