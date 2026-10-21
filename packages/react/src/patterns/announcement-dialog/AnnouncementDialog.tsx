import {
  Text,
  cx,
  opensElsewhere,
  useControllableState,
  useStoredState,
} from "@buttery/core";
import { useRef, useState } from "react";
import type {
  CSSProperties,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { ArrowLink } from "../../components/arrow-link/ArrowLink.tsx";
import { Button } from "../../components/button/Button.tsx";
import { Dialog } from "../../components/dialog/Dialog.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** One part of an announcement: a subheading over a paragraph. */
export interface AnnouncementSection {
  /** The subheading, in `title-sm`. Leave it out for a closing paragraph. */
  readonly title?: string | undefined;
  /** What's new, in `body`. */
  readonly body: ReactNode;
}

/** Props for `AnnouncementDialog`. */
export interface AnnouncementDialogProps {
  /** The dialog's content box. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The button that opens it again later. */
  readonly trigger?: ReactElement | undefined;
  /** What's new, in `title-lg`. It names the dialog. */
  readonly title: string;
  /** The parts of the announcement, 24px apart. */
  readonly sections: readonly AnnouncementSection[];
  /** The app's own illustration of what's new, beside the copy or above it when narrow. */
  readonly media?: ReactNode;
  /** The primary button, which closes it. Defaults to `"Got it"`. */
  readonly doneLabel?: string | undefined;
  /**
   * Where to read more, beside the button. A link to another site (`https://…`) shows the external icon;
   * a page in the app or an action shows the forward arrow and closes the dialog as it goes.
   */
  readonly learnMore?: GuidanceAction | undefined;
  /** Shows it by itself once per key, the first time the page opens, and never again once closed. */
  readonly storageKey?: string | undefined;
  /** Whether it's open, when you control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to opening on a first visit with `storageKey`, else `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the content inside the dialog, the element that carries `data-bt="AnnouncementDialog"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
}

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/** Whether `href` leaves the app: a full URL such as `https://…` or `mailto:`, rather than a path or a hash. */
function leavesApp(href: string): boolean {
  return /^[a-z][a-z\d+.-]*:/i.test(href);
}

/**
 * What's new, once: a large dialog (880 wide, padded 32) with its title in `title-lg` and short sections
 * of a `title-sm` subheading over `body` text, the app's illustration beside them (above them under 720px
 * of room), and at the bottom of the copy a primary Got it button and a link to read more. With a
 * `storageKey` it opens by itself the first time and never again once closed.
 *
 * @example
 * <AnnouncementDialog
 *   storageKey="roast-scheduling"
 *   title="Roasts plan themselves now"
 *   sections={[{ title: "A week ahead", body: "Orders and subscriptions fill next week's roasts." }]}
 *   media={<img src={schedulePreview} alt="Next week's roasts, filled in" />}
 *   learnMore={{ label: "How roast planning works", href: "/docs/roast-planning" }}
 * />
 */
export function AnnouncementDialog({
  ref,
  trigger,
  title,
  sections,
  media,
  doneLabel = "Got it",
  learnMore,
  storageKey,
  open,
  defaultOpen,
  onOpenChange,
  closeLabel,
  className,
  style,
}: AnnouncementDialogProps): ReactElement {
  const [seen, setSeen] = useStoredState(
    storageKey === undefined ? undefined : `buttery:announcement:${storageKey}`,
    false,
    isFlag,
  );
  const [firstTime] = useState(
    defaultOpen ?? (storageKey !== undefined && !seen),
  );
  const openedByItself = useRef(open === undefined && firstTime);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: firstTime,
    onChange: onOpenChange,
  });

  const change = (next: boolean): void => {
    if (!next) setSeen(true);
    setOpen(next);
  };

  const readMore = (event: MouseEvent<HTMLElement>): void => {
    learnMore?.onClick?.(event);
    if (learnMore?.href !== undefined && opensElsewhere(event)) return;
    change(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={change}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content
        size="lg"
        ref={ref}
        closeLabel={closeLabel}
        onCloseAutoFocus={(event) => {
          // Opened by itself, it wasn't opened from its trigger, so focus goes back to the page, not there.
          if (openedByItself.current) event.preventDefault();
          openedByItself.current = false;
        }}
      >
        <div
          className={cx("bt-announcement-dialog", className)}
          style={style}
          data-bt="AnnouncementDialog"
        >
          <div
            data-bt-part="layout"
            data-media={media === undefined ? undefined : ""}
          >
            <div data-bt-part="copy">
              <Dialog.Text size="feature" title={title} />
              {sections.map((section, index) => (
                <section key={section.title ?? index} data-bt-part="section">
                  {section.title === undefined ? null : (
                    <Text variant="title-sm" asChild>
                      <h3>{section.title}</h3>
                    </Text>
                  )}
                  <Text variant="body">{section.body}</Text>
                </section>
              ))}
              <div data-bt-part="actions">
                <Dialog.Close asChild>
                  <Button variant="primary">{doneLabel}</Button>
                </Dialog.Close>
                {learnMore === undefined ? null : learnMore.href ===
                  undefined ? (
                  <ArrowLink arrow="forward" asChild>
                    <button type="button" onClick={readMore}>
                      {learnMore.label}
                    </button>
                  </ArrowLink>
                ) : leavesApp(learnMore.href) ? (
                  <ArrowLink
                    arrow="external"
                    href={learnMore.href}
                    onClick={learnMore.onClick}
                  >
                    {learnMore.label}
                  </ArrowLink>
                ) : (
                  <ArrowLink
                    arrow="forward"
                    href={learnMore.href}
                    onClick={readMore}
                  >
                    {learnMore.label}
                  </ArrowLink>
                )}
              </div>
            </div>
            {media === undefined ? null : (
              <div data-bt-part="media" data-bt-clip="">
                {media}
              </div>
            )}
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}
