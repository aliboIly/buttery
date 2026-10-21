import {
  Icon,
  Text,
  cx,
  useControllableState,
  useMergedRefs,
} from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { useRef, useState } from "react";
import type {
  ComponentType,
  CSSProperties,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { Dialog } from "../../components/dialog/Dialog.tsx";

/** One thing that saying yes will do, a row of a `ConsequenceDialog`. */
export interface ConsequenceItem {
  /** A 16px icon in a 32px tile at the row's start. */
  readonly icon: ComponentType<IconComponentProps>;
  /** What happens, in `title-sm`, such as "Then $39 a month". */
  readonly title: string;
  /** The detail, in `body-sm`. */
  readonly body: ReactNode;
}

/** Props for `ConsequenceDialog`. */
export interface ConsequenceDialogProps {
  /** The control that opens it, such as a plan's button. Leave it out to open it from code with `open`. */
  readonly trigger?: ReactNode;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** What's being confirmed, in `title-lg`, which names the dialog. */
  readonly title: string;
  /** What saying yes will do, a row each. */
  readonly items: readonly ConsequenceItem[];
  /** Small print under a divider, in `caption`, links welcome. */
  readonly terms?: ReactNode;
  /** The confirm button's label, such as "Start the trial". */
  readonly confirmLabel: string;
  /**
   * Called on the confirm button. It closes once this returns, or once the promise it returns resolves,
   * the button showing busy until then; a rejected promise leaves it open.
   */
  readonly onConfirm: () => void | Promise<void>;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the dialog's content, the element that carries `data-bt="ConsequenceDialog"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
  /** The dialog element. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A dialog that spells out what saying yes will do before anyone does: its title in `title-lg`, then rows
 * 20 apart, each a 32px icon tile and a heading over a line; then small print under a 1px divider; then
 * one full-width primary button. Focus goes to the dialog itself, so the rows are read before anything can
 * be confirmed. It closes after `onConfirm`, or after the promise it returns resolves.
 *
 * @example
 * <ConsequenceDialog
 *   trigger={<Button variant="primary">Try Roaster</Button>}
 *   title="Try the Roaster plan"
 *   items={[{ icon: Gift, title: "First 30 days free", body: "You keep your Starter price during the trial." }]}
 *   confirmLabel="Start the trial"
 *   onConfirm={startTrial}
 * />
 */
export function ConsequenceDialog({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  items,
  terms,
  confirmLabel,
  onConfirm,
  closeLabel,
  className,
  style,
  ref,
}: ConsequenceDialogProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [pending, setPending] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, dialog);
  const confirm = (): void => {
    if (pending) return;
    const result = onConfirm();
    if (result === undefined) {
      setOpen(false);
      return;
    }
    setPending(true);
    void result.then(
      () => {
        setPending(false);
        setOpen(false);
      },
      () => {
        setPending(false);
      },
    );
  };
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content
        size="md"
        ref={refs}
        closeLabel={closeLabel}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          dialog.current?.focus({ preventScroll: true });
        }}
      >
        <div
          className={cx("bt-consequence-dialog", className)}
          style={style}
          data-bt="ConsequenceDialog"
        >
          <Dialog.Text title={title} size="feature" />
          <Dialog.Body>
            <ul data-bt-part="items">
              {items.map((item) => (
                <li key={item.title} data-bt-part="item">
                  <span data-bt-part="tile" aria-hidden="true">
                    <Icon icon={item.icon} />
                  </span>
                  <span data-bt-part="item-text">
                    <Text variant="title-sm">{item.title}</Text>
                    <Text variant="body-sm">{item.body}</Text>
                  </span>
                </li>
              ))}
            </ul>
            {terms === undefined ? null : (
              <div className="bt-text" data-role="caption" data-bt-part="terms">
                {terms}
              </div>
            )}
            <div data-bt-part="confirm">
              <Button
                variant="primary"
                size="cta"
                shape="rounded"
                loading={pending}
                onClick={confirm}
              >
                {confirmLabel}
              </Button>
            </div>
          </Dialog.Body>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
