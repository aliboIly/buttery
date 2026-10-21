import { cx, hasContent } from "@buttery/core";
import type { CSSProperties, ReactElement, ReactNode, Ref } from "react";
import { Dialog } from "../../components/dialog/Dialog.tsx";

/** Props for `FullscreenDialog`. */
export interface FullscreenDialogProps {
  /** The control that opens it. Leave it out to open it from code with `open`. */
  readonly trigger?: ReactNode;
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The question, the strong first part of the headline, such as "What do you need to get started?". */
  readonly title: string;
  /** The headline's quieter second part, in the same line, such as "You can change this later." */
  readonly note?: string | undefined;
  /** A mark at the top start, such as the app's own. */
  readonly logo?: ReactNode;
  /** The answer, such as `OptionTiles`, under the headline. */
  readonly children?: ReactNode;
  /** Buttons at the bottom end, such as Cancel and Save. */
  readonly actions?: ReactNode;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the dialog's content, the element that carries `data-bt="FullscreenDialog"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
  /** The dialog element. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/**
 * A dialog that takes the whole window, 16px in from every edge, for one big question, such as what
 * someone needs to get started. A mark sits at its top start and the close button at its top end, 32px in
 * from 640px of width and 24px in under it; the headline, a strong question and a quieter note in one line
 * in `title-lg`, sits over the answer in a column 640 wide at most; its actions sit at the bottom end, as
 * far in. It fades in and out over `dur-fast` without growing, and names itself by the whole headline.
 * Wrap an action in `Dialog.Close asChild` to close it as well.
 *
 * @example
 * <FullscreenDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="What do you need to get started?"
 *   note="You can change this later."
 *   actions={<Button variant="primary" onClick={save}>Save</Button>}
 * >
 *   <OptionTiles label="What you need" options={needs} value={chosen} onValueChange={setChosen} />
 * </FullscreenDialog>
 */
export function FullscreenDialog({
  trigger,
  open,
  defaultOpen,
  onOpenChange,
  title,
  note,
  logo,
  children,
  actions,
  closeLabel,
  className,
  style,
  ref,
}: FullscreenDialogProps): ReactElement {
  return (
    <Dialog open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content size="full" ref={ref} closeLabel={closeLabel}>
        <div
          className={cx("bt-fullscreen-dialog", className)}
          style={style}
          data-bt="FullscreenDialog"
        >
          <div data-bt-part="top">{hasContent(logo) ? logo : null}</div>
          <div data-bt-part="question">
            <div data-bt-part="column">
              <Dialog.Text
                size="feature"
                title={
                  <>
                    {title}
                    {note === undefined ? null : (
                      <>
                        {" "}
                        <span data-bt-part="note">{note}</span>
                      </>
                    )}
                  </>
                }
              />
              {hasContent(children) ? (
                <div data-bt-part="answer">{children}</div>
              ) : null}
            </div>
          </div>
          {hasContent(actions) ? (
            <div data-bt-part="actions">{actions}</div>
          ) : null}
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
