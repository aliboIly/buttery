import {
  Layer,
  Scrim,
  TextStack,
  cx,
  presencePresets,
  reducedPresence,
  tabbables,
  useAnimationTracking,
  useCloseFocus,
  useControllableState,
  useMergedRefs,
  useMotionPreference,
  warnOnce,
} from "@buttery/core";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import {
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { IconButton } from "../icon-button/IconButton.tsx";

/** How wide a dialog is: `"sm"` (400px), `"md"` (560px) or `"lg"` (880px), never wider than the window allows. */
export type DialogSize = "sm" | "md" | "lg";

const OpenContext = createContext(false);

const TriggerContext = createContext<RefObject<HTMLElement | null> | null>(
  null,
);

/**
 * How `Dialog.Text` tells the content around it that it has a title, and a description when it has a body.
 * It counts, since text that crossfades (an onboarding's steps) is briefly there twice.
 */
// A dialog that has a field to type in opens on it, as a form dialog's first field takes focus.
const TEXT_ENTRY =
  'input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"], [type="reset"]), textarea, [role="combobox"]';

function takesText(element: HTMLElement): boolean {
  return element.matches(TEXT_ENTRY);
}

interface ContentRegistry {
  readonly register: (withBody: boolean) => () => void;
  readonly describe: () => () => void;
}

const ContentContext = createContext<ContentRegistry | null>(null);

/** Props for `Dialog`. */
export interface DialogProps {
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes: its trigger, a close button, Escape or a press outside. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** The trigger and the content. */
  readonly children?: ReactNode;
}

function DialogRoot({
  open,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps): ReactElement {
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const trigger = useRef<HTMLElement>(null);
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={setOpen}>
      <TriggerContext value={trigger}>
        <OpenContext value={isOpen}>{children}</OpenContext>
      </TriggerContext>
    </RadixDialog.Root>
  );
}

/** Props for `Dialog.Trigger`. */
export type DialogTriggerProps = ComponentPropsWithRef<
  typeof RadixDialog.Trigger
>;

/** The control that opens the dialog. Use `asChild` to make your own button the trigger. */
export function DialogTrigger({
  ref,
  ...props
}: DialogTriggerProps): ReactElement {
  const trigger = use(TriggerContext);
  const refs = useMergedRefs(ref, trigger ?? undefined);
  return <RadixDialog.Trigger {...props} ref={refs} />;
}

/** Props for `Dialog.Close`. */
export type DialogCloseProps = ComponentPropsWithRef<typeof RadixDialog.Close>;

/** Closes the dialog when pressed, such as a Cancel button. Use `asChild` to make your own button do it. */
export function DialogClose(props: DialogCloseProps): ReactElement {
  return <RadixDialog.Close {...props} />;
}

/** Props for `Dialog.Content`. */
export interface DialogContentProps extends Omit<
  ComponentPropsWithRef<typeof RadixDialog.Content>,
  "forceMount" | "asChild"
> {
  /** How wide it is: `"sm"` (400px, the default), `"md"` (560px) or `"lg"` (880px). */
  readonly size?: DialogSize | undefined;
  /** Names the dialog for screen readers when it has no `Dialog.Text` title to name it. */
  readonly label?: string | undefined;
  /** Describes the dialog for screen readers when it has no `Dialog.Text` body to describe it. */
  readonly description?: ReactNode;
  /** Whether it shows a close button in its top corner. Defaults to `true`. */
  readonly showClose?: boolean | undefined;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
}

/**
 * The dialog itself, over a dim scrim in the modal layer, centered and kept 16px inside the window. It
 * fades in over `dur-fast`, growing from 97%, and fades out as quickly. Its close button sits in the top
 * corner, over the media when there is some. Lay it out with `Dialog.Media`, `Dialog.Text`, `Dialog.Body`
 * and `Dialog.Actions`, directly or inside a `<form>`; a dialog without a `Dialog.Text` title needs a `label`.
 */
export function DialogContent({
  size = "sm",
  label,
  description,
  showClose = true,
  closeLabel = "Close",
  className,
  children,
  onOpenAutoFocus,
  onCloseAutoFocus,
  ref,
  ...rest
}: DialogContentProps): ReactElement {
  const open = use(OpenContext);
  const trigger = use(TriggerContext);
  const reduced = useMotionPreference() === "reduced";
  const tracking = useAnimationTracking();
  const [described, setDescribed] = useState(false);
  const titles = useRef(0);
  const descriptions = useRef(0);
  const element = useRef<HTMLDivElement>(null);
  const refs = useMergedRefs(ref, element);
  const body = useRef<HTMLDivElement>(null);
  const focusOnSettle = useRef(false);
  const closeFocus = useCloseFocus(open, element, trigger ?? undefined);
  const registry = useMemo<ContentRegistry>(
    () => ({
      register: (withBody) => {
        titles.current += 1;
        if (withBody) descriptions.current += 1;
        setDescribed(descriptions.current > 0);
        return () => {
          titles.current -= 1;
          if (withBody) descriptions.current -= 1;
          setDescribed(descriptions.current > 0);
        };
      },
      describe: () => {
        descriptions.current += 1;
        setDescribed(true);
        return () => {
          descriptions.current -= 1;
          setDescribed(descriptions.current > 0);
        };
      },
    }),
    [],
  );
  const motionOf = reduced ? reducedPresence : presencePresets.dialog;
  const scrim = reduced ? reducedPresence : presencePresets.scrim;

  // Dialog.Text registers its title in a layout effect, which runs before this effect does.
  useEffect(() => {
    if (!open || titles.current > 0 || label !== undefined) return;
    warnOnce(
      "Dialog",
      'A dialog has no name, so screen readers announce it as just "dialog". Fix: put a <Dialog.Text title="…" /> in it, or pass label="…" to Dialog.Content.',
    );
  }, [open, label]);

  return (
    <AnimatePresence>
      {open ? (
        <Layer band="modal" key="dialog">
          <RadixDialog.Overlay forceMount asChild>
            <motion.div
              initial={scrim.initial}
              animate={scrim.animate}
              exit={scrim.exit}
              className="bt-dialog-scrim"
              data-bt-part="scrim"
            >
              <Scrim />
            </motion.div>
          </RadixDialog.Overlay>
          <div className="bt-dialog-frame" data-bt-part="frame">
            <RadixDialog.Content
              {...rest}
              {...(described || description !== undefined
                ? {}
                : { "aria-describedby": undefined })}
              ref={refs}
              aria-modal="true"
              forceMount
              asChild
              onOpenAutoFocus={(event) => {
                onOpenAutoFocus?.(event);
                if (event.defaultPrevented) return;
                // Focus waits in the dialog until it has settled, then goes to its first tab stop, so a ring
                // never grows with it. Radix would skip links for the close button, whose tooltip would open.
                event.preventDefault();
                element.current?.focus({ preventScroll: true });
                focusOnSettle.current = true;
              }}
              onCloseAutoFocus={(event) => {
                onCloseAutoFocus?.(event);
                if (!event.defaultPrevented) closeFocus(event);
              }}
            >
              <motion.div
                {...tracking}
                onAnimationComplete={() => {
                  tracking.onAnimationComplete();
                  if (!focusOnSettle.current) return;
                  focusOnSettle.current = false;
                  if (document.activeElement !== element.current) return;
                  const stops = tabbables(body.current);
                  (stops.find(takesText) ?? stops[0])?.focus();
                }}
                initial={motionOf.initial}
                animate={motionOf.animate}
                exit={motionOf.exit}
                className={cx("bt-dialog bt-surface", className)}
                data-level="dialog"
                data-size={size}
                data-closable={showClose ? "" : undefined}
                data-bt="Dialog"
              >
                {label === undefined ? null : (
                  <VisuallyHidden.Root asChild>
                    <RadixDialog.Title>{label}</RadixDialog.Title>
                  </VisuallyHidden.Root>
                )}
                {description === undefined ? null : (
                  <VisuallyHidden.Root asChild>
                    <RadixDialog.Description>
                      {description}
                    </RadixDialog.Description>
                  </VisuallyHidden.Root>
                )}
                <ContentContext value={registry}>
                  <div ref={body} data-bt-part="scroll">
                    {children}
                  </div>
                </ContentContext>
                {showClose ? (
                  <RadixDialog.Close asChild>
                    <IconButton
                      icon={X}
                      label={closeLabel}
                      size="sm"
                      data-bt-part="close"
                      data-bt-allow-overlap=""
                    />
                  </RadixDialog.Close>
                ) : null}
              </motion.div>
            </RadixDialog.Content>
          </div>
        </Layer>
      ) : null}
    </AnimatePresence>
  );
}

/** Props for `Dialog.Media`. */
export type DialogMediaProps = ComponentPropsWithRef<"div">;

/**
 * A picture or a small scene at the top of the dialog, 8px in from its edges with corners that follow the
 * dialog's (10px inside its 18px). Mark it `aria-hidden` when it only decorates.
 */
export function DialogMedia({
  className,
  children,
  ...rest
}: DialogMediaProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-dialog-media", className)}
      data-bt-part="media"
    >
      <div data-bt-part="picture" data-bt-clip="">
        {children}
      </div>
    </div>
  );
}

/** Props for `Dialog.Description`. */
export type DialogDescriptionProps = ComponentPropsWithRef<"p">;

/**
 * Copy in the dialog's body that describes it for screen readers, such as what a form is for, with links
 * in it. Use it when the description sits under a divider or among fields rather than in `Dialog.Text`.
 */
export function DialogDescription({
  className,
  ...rest
}: DialogDescriptionProps): ReactElement {
  const content = use(ContentContext);

  useLayoutEffect(() => content?.describe(), [content]);

  return (
    <RadixDialog.Description asChild>
      <p
        {...rest}
        className={cx("bt-text bt-dialog-description", className)}
        data-role="body-sm"
        data-bt-part="description"
      />
    </RadixDialog.Description>
  );
}

/** Props for `Dialog.Text`. */
export interface DialogTextProps extends Omit<
  ComponentPropsWithRef<"div">,
  "title"
> {
  /** The dialog's title, which names it for screen readers. */
  readonly title: ReactNode;
  /** A line or two under the title, which describes the dialog for screen readers. */
  readonly body?: ReactNode;
  /** A short note under the body, such as a keyboard tip. */
  readonly caption?: ReactNode;
  /** `"start"` (the default) or `"center"`. */
  readonly align?: "start" | "center" | undefined;
  /** `"dialog"` (the default), a dialog title, or `"feature"`, a `title-lg` title as an announcement has. */
  readonly size?: "dialog" | "feature" | undefined;
}

/**
 * The dialog's title, body and caption, padded 24px, measured between trimmed text: the body 16 under the
 * title and the caption 20 under the body. The title names the dialog and the body describes it.
 */
export function DialogText({
  title,
  body,
  caption,
  align = "start",
  size = "dialog",
  className,
  ...rest
}: DialogTextProps): ReactElement {
  const content = use(ContentContext);
  const hasBody = body !== undefined && body !== null && body !== false;

  useLayoutEffect(() => content?.register(hasBody), [content, hasBody]);

  return (
    <TextStack
      {...rest}
      className={cx("bt-dialog-text", className)}
      size={size}
      align={align}
      data-bt-part="text"
      title={
        <RadixDialog.Title asChild>
          <span>{title}</span>
        </RadixDialog.Title>
      }
      body={
        hasBody ? (
          <RadixDialog.Description asChild>
            <span>{body}</span>
          </RadixDialog.Description>
        ) : undefined
      }
      caption={caption}
    />
  );
}

/** Props for `Dialog.Body`. */
export type DialogBodyProps = ComponentPropsWithRef<"div">;

/** Content between the text and the actions, such as fields or a list, padded 24px at the sides and 20 under the text. */
export function DialogBody({
  className,
  ...rest
}: DialogBodyProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-dialog-body", className)}
      data-bt-part="body"
    />
  );
}

/** Props for `Dialog.Actions`. */
export type DialogActionsProps = ComponentPropsWithRef<"div">;

/**
 * The dialog's buttons in equal columns 8px apart, padded 24px at the sides and bottom, 20px under the
 * text. Give them `size="cta"` and `shape="rounded"` for the 48px dialog buttons.
 */
export function DialogActions({
  className,
  ...rest
}: DialogActionsProps): ReactElement {
  return (
    <div
      {...rest}
      className={cx("bt-dialog-actions", className)}
      data-bt-part="actions"
    />
  );
}

/** `Dialog` with its parts. */
export interface DialogComponent {
  (props: DialogProps): ReactElement;
  /** The control that opens the dialog. */
  readonly Trigger: typeof DialogTrigger;
  /** The dialog itself, over the scrim. */
  readonly Content: typeof DialogContent;
  /** A picture or scene at the top. */
  readonly Media: typeof DialogMedia;
  /** The title, body and caption. */
  readonly Text: typeof DialogText;
  /** Copy in the body that describes the dialog. */
  readonly Description: typeof DialogDescription;
  /** Content between the text and the actions. */
  readonly Body: typeof DialogBody;
  /** The buttons. */
  readonly Actions: typeof DialogActions;
  /** Closes the dialog when pressed. */
  readonly Close: typeof DialogClose;
}

/**
 * A modal dialog: it dims the page, traps focus inside, closes on Escape, its close button or a press
 * outside, and hands focus back to whatever opened it. It fades in over `dur-fast` growing from 97% and
 * leaves as quickly. Controlled with `open`/`onOpenChange` or uncontrolled with `defaultOpen`.
 *
 * @example
 * <Dialog>
 *   <Dialog.Trigger asChild><Button variant="soft">Delete card</Button></Dialog.Trigger>
 *   <Dialog.Content>
 *     <Dialog.Text title="Delete this card?" body="It stays in the trash for 30 days." />
 *     <Dialog.Actions>
 *       <Dialog.Close asChild><Button variant="soft" size="cta" shape="rounded">Keep it</Button></Dialog.Close>
 *       <Button variant="primary" size="cta" shape="rounded" onClick={remove}>Delete</Button>
 *     </Dialog.Actions>
 *   </Dialog.Content>
 * </Dialog>
 */
export const Dialog: DialogComponent = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Media: DialogMedia,
  Description: DialogDescription,
  Text: DialogText,
  Body: DialogBody,
  Actions: DialogActions,
  Close: DialogClose,
});
