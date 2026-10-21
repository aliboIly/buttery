import { Text, cx, useControllableState, useStoredState } from "@buttery/core";
import { useState } from "react";
import type { ReactElement, ReactNode, Ref } from "react";
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
  /** Where to read more, as a link with an external icon beside the button. */
  readonly learnMore?: GuidanceAction | undefined;
  /** Shows it by itself once per key, the first time the page opens, and never again once closed. */
  readonly storageKey?: string | undefined;
  /** Whether it's open, when you control it. */
  readonly open?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Names the close button. Defaults to `"Close"`. */
  readonly closeLabel?: string | undefined;
  /** Classes for the content inside the dialog. */
  readonly className?: string | undefined;
}

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
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
  onOpenChange,
  closeLabel,
  className,
}: AnnouncementDialogProps): ReactElement {
  const [seen, setSeen] = useStoredState(
    storageKey === undefined ? undefined : `buttery:announcement:${storageKey}`,
    false,
    isFlag,
  );
  const [firstTime] = useState(storageKey !== undefined && !seen);
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: firstTime,
    onChange: onOpenChange,
  });

  const change = (next: boolean): void => {
    if (!next) setSeen(true);
    setOpen(next);
  };

  return (
    <Dialog open={isOpen} onOpenChange={change}>
      {trigger === undefined ? null : (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      )}
      <Dialog.Content size="lg" ref={ref} closeLabel={closeLabel}>
        <div
          className={cx("bt-announcement-dialog", className)}
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
                  <ArrowLink arrow="external" asChild>
                    <button type="button" onClick={learnMore.onClick}>
                      {learnMore.label}
                    </button>
                  </ArrowLink>
                ) : (
                  <ArrowLink
                    arrow="external"
                    href={learnMore.href}
                    onClick={learnMore.onClick}
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
