import { cx, useControllableState } from "@buttery/core";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  ReactElement,
  ReactNode,
  Ref,
  SubmitEvent,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { Dialog } from "../../components/dialog/Dialog.tsx";

/** Props for `FormDialog`. */
export interface FormDialogProps {
  /** The control that opens it, such as a `Button`. Leave it out to open it from code with `open`. */
  readonly trigger?: ReactNode;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Its title, over a divider, which names it. */
  readonly title: string;
  /** Copy under the divider that says what the form is for and can hold links; it describes the dialog. */
  readonly description?: ReactNode;
  /** The fields, such as a `TextField`. The first one takes focus once the dialog has settled. */
  readonly children?: ReactNode;
  /** Whether the form can be sent, which enables Submit. Defaults to `true`. */
  readonly valid?: boolean | undefined;
  /**
   * Sends the form: called on Submit, or Enter in a field, while it's valid. It closes once this returns,
   * or once the promise it returns resolves, Submit showing busy until then and nothing closing it meanwhile;
   * a rejected promise leaves it open.
   */
  readonly onSubmit: () => void | Promise<void>;
  /** Submit's label. Defaults to `"Save"`. */
  readonly submitLabel?: string | undefined;
  /** Cancel's label. Defaults to `"Cancel"`. */
  readonly cancelLabel?: string | undefined;
  /** `"sm"` (400px, the default) or `"md"` (560px). */
  readonly size?: "sm" | "md" | undefined;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the dialog's content, the element that carries `data-bt="FormDialog"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
  /** The dialog element. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A dialog that asks for a value or two: its title over a 1px divider, then copy that says what the form
 * is for (links welcome), the fields (the first focused once the dialog settles), and Cancel and Submit at
 * the end of its footer. Submit stays disabled (`aria-disabled`) until `valid`. It closes after a submit,
 * or after the promise `onSubmit` returns resolves; until then Cancel and the close button show disabled, and
 * Escape and the scrim leave it open.
 *
 * @example
 * <FormDialog
 *   trigger={<Button>Add a backup email</Button>}
 *   title="Add a backup email"
 *   description={<>We send sign-in codes there. <a href="/help/backup">Why?</a></>}
 *   valid={email.includes("@")}
 *   onSubmit={() => save(email)}
 * >
 *   <TextField label="Backup email" type="email" value={email} onValueChange={setEmail} />
 * </FormDialog>
 */
export function FormDialog({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  children,
  valid = true,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  size = "sm",
  closeLabel,
  className,
  style,
  ref,
}: FormDialogProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const [pending, setPending] = useState(false);
  const session = useRef(0);
  if (!isOpen && pending) setPending(false);
  useLayoutEffect(() => {
    if (!isOpen) session.current += 1;
  }, [isOpen]);
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!valid || pending) return;
    const result = onSubmit();
    if (result === undefined) {
      setOpen(false);
      return;
    }
    setPending(true);
    const asked = session.current;
    void result.then(
      () => {
        if (asked !== session.current) return;
        setPending(false);
        setOpen(false);
      },
      () => {
        if (asked !== session.current) return;
        setPending(false);
      },
    );
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next && pending) return;
        setOpen(next);
      }}
    >
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content
        size={size}
        ref={ref}
        closeLabel={closeLabel}
        closeDisabled={pending}
      >
        <div
          className={cx("bt-form-dialog", className)}
          style={style}
          data-bt="FormDialog"
        >
          <Dialog.Text title={title} />
          <form onSubmit={submit} data-bt-part="form">
            <Dialog.Body>
              {description === undefined ? null : (
                <Dialog.Description>{description}</Dialog.Description>
              )}
              {children}
            </Dialog.Body>
            <div data-bt-part="form-dialog-footer">
              <Dialog.Close asChild>
                <Button variant="soft" aria-disabled={pending || undefined}>
                  {cancelLabel}
                </Button>
              </Dialog.Close>
              <Button
                type="submit"
                variant="primary"
                aria-disabled={!valid || undefined}
                loading={pending}
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
