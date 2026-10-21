import {
  Popover,
  Text,
  tabbables,
  useControllableState,
  useMergedRefs,
  useStoredState,
} from "@buttery/core";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useId, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** Props for `NotificationNudge`. */
export interface NotificationNudgeProps {
  /** The nudge's panel, while it's open. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The button it points at, usually an `IconButton` with `dot`. Pressing it opens and closes the nudge. */
  readonly children: ReactElement;
  /** What's new, in `title-sm`. It names the nudge and is announced when it opens by itself. */
  readonly title: string;
  /** A line more about it, in `body-sm`. */
  readonly description?: ReactNode;
  /** What to do about it, as a small primary button. */
  readonly action: GuidanceAction;
  /** The ghost button that puts it off. Defaults to `"Later"`. */
  readonly laterLabel?: string | undefined;
  /** Called when Later is pressed. */
  readonly onLater?: (() => void) | undefined;
  /** It opens by itself once per key, and not again once it has closed. Without one it opens by itself on every visit. */
  readonly storageKey?: string | undefined;
  /** Whether it's open, when you control it. */
  readonly open?: boolean | undefined;
  /**
   * Whether it starts open when uncontrolled, without taking focus. Defaults to `false`; with `storageKey`
   * it opens by itself once in view.
   */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Classes for the nudge's body, the element that carries `data-bt="NotificationNudge"`. */
  readonly className?: string | undefined;
  /** Inline styles for the same element. */
  readonly style?: CSSProperties | undefined;
  /** The side of the button it opens on. Defaults to `"bottom"`. */
  readonly side?: "top" | "right" | "bottom" | "left" | undefined;
  /** Which edge of the button it lines up with. Defaults to `"end"`. */
  readonly align?: "start" | "center" | "end" | undefined;
}

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * A small popover that points at a button with news, such as replies waiting behind the notifications bell:
 * its title, a line, an action and Later. It opens by itself once per `storageKey`, as soon as its button
 * is fully in view and no modal dialog is open, without taking focus, and its title is announced as a
 * status; if the button leaves the view, folding into a menu or scrolling away, the nudge goes too and comes
 * back with it. Tab from its button goes into it, and out of it to what follows the button. Any way someone
 * closes it counts as seen. Controlled with `open`, it opens only when you say.
 *
 * @example
 * <NotificationNudge
 *   title="2 customers asked about delivery"
 *   description="Reply before the roast ships on Tuesday."
 *   action={{ label: "Read messages", href: "/messages" }}
 *   storageKey="delivery-questions"
 * >
 *   <IconButton icon={Bell} label="Notifications" dot />
 * </NotificationNudge>
 */
export function NotificationNudge({
  ref,
  children,
  title,
  description,
  action,
  laterLabel = "Later",
  onLater,
  storageKey,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  style,
  side = "bottom",
  align = "end",
}: NotificationNudgeProps): ReactElement {
  const titleId = useId();
  const [seen, setSeen] = useStoredState(
    storageKey === undefined ? undefined : `buttery:nudge:${storageKey}`,
    false,
    isFlag,
  );
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  // Open from the start means nobody asked for it, so it takes no focus, as when it opens by itself.
  const byItself = useRef(isOpen);
  const [announcement, setAnnouncement] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const panelRefs = useMergedRefs(ref, panel);

  useEffect(() => {
    const button = trigger.current;
    if (seen || open !== undefined || button === null) return undefined;
    let waiting: MutationObserver | null = null;
    const behindModal = (): boolean =>
      document.querySelector('[aria-modal="true"]') !== null;
    const appear = (): void => {
      byItself.current = true;
      setOpen(true);
      setAnnouncement(title);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        waiting?.disconnect();
        waiting = null;
        if (entry?.isIntersecting !== true) {
          if (byItself.current) setOpen(false);
          return;
        }
        if (!behindModal()) {
          appear();
          return;
        }
        waiting = new MutationObserver(() => {
          if (behindModal()) return;
          waiting?.disconnect();
          appear();
        });
        waiting.observe(document.body, { childList: true, subtree: true });
      },
      { threshold: 1 },
    );
    observer.observe(button);
    return () => {
      observer.disconnect();
      waiting?.disconnect();
    };
  }, [seen, open, title, setOpen]);

  const change = (next: boolean): void => {
    byItself.current = false;
    if (!next) setSeen(true);
    setOpen(next);
  };

  const enter = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== "Tab" || event.shiftKey || !isOpen) return;
    const first = tabbables(panel.current)[0];
    if (first === undefined) return;
    event.preventDefault();
    first.focus();
  };

  const leave = (event: KeyboardEvent<HTMLElement>): void => {
    if (event.key !== "Tab") return;
    const inside = tabbables(panel.current);
    const button = trigger.current;
    if (button === null) return;
    if (event.shiftKey && document.activeElement === inside[0]) {
      event.preventDefault();
      button.focus();
    } else if (!event.shiftKey && document.activeElement === inside.at(-1)) {
      const order = tabbables(document.body);
      const next = order
        .slice(order.indexOf(button) + 1)
        .find((candidate) => !panel.current?.contains(candidate));
      if (next === undefined) return;
      event.preventDefault();
      next.focus();
    }
  };

  const act = (event: MouseEvent<HTMLElement>): void => {
    action.onClick?.(event);
    change(false);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={change}>
        <Popover.Trigger asChild ref={trigger} onKeyDown={enter}>
          {children}
        </Popover.Trigger>
        <Popover.Content
          side={side}
          align={align}
          aria-labelledby={titleId}
          className="bt-notification-nudge"
          onOpenAutoFocus={(event) => {
            if (byItself.current) event.preventDefault();
          }}
          onKeyDown={leave}
        >
          <div
            ref={panelRefs}
            className={className}
            style={style}
            data-bt="NotificationNudge"
            data-bt-part="body"
          >
            <Text id={titleId} variant="title-sm">
              {title}
            </Text>
            {description === undefined ? null : (
              <Text variant="body-sm">{description}</Text>
            )}
            <div data-bt-part="notification-nudge-actions">
              {action.href === undefined ? (
                <Button variant="primary" size="sm" onClick={act}>
                  {action.label}
                </Button>
              ) : (
                <Button variant="primary" size="sm" asChild>
                  <a href={action.href} onClick={act}>
                    {action.label}
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onLater?.();
                  change(false);
                }}
              >
                {laterLabel}
              </Button>
            </div>
          </div>
        </Popover.Content>
      </Popover>
      <VisuallyHidden.Root role="status">{announcement}</VisuallyHidden.Root>
    </>
  );
}
