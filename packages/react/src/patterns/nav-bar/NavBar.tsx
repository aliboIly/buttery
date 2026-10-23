import {
  Layer,
  Scrim,
  Sticky,
  cx,
  displayBreakpoints,
  hasContent,
  heights,
  opensElsewhere,
  presencePresets,
  reducedPresence,
  scrollRootOf,
  space,
  tabbables,
  useButteryTransition,
  useMergedRefs,
  useMotionPreference,
} from "@butteryui/core";
import { Menu as MenuIcon, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import type { MotionStyle } from "motion/react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type {
  ComponentPropsWithRef,
  ReactElement,
  ReactNode,
  RefObject,
} from "react";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { Container } from "../container/Container.tsx";
import { MorphMenu } from "../morph-menu/MorphMenu.tsx";

/** How a nav bar behaves as the page scrolls. */
export type NavBarBehavior = "static" | "sticky" | "auto-hide";

/**
 * How a nav bar is drawn: `"plain"`, across the top with no background until it's pinned over the page; or
 * `"floating"`, a rounded surface with a shadow, inset from the window's edges.
 */
export type NavBarVariant = "plain" | "floating";

/** Props for `NavBar`. */
export interface NavBarProps extends Omit<
  ComponentPropsWithRef<"header">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
> {
  /** The start of the bar: the product's mark and name, usually a link home. */
  readonly brand?: ReactNode;
  /**
   * A search after the menus, before the actions: a `CommandSearch` or a soft `SearchField`, at most 360px,
   * narrowing before the menus fold. It stays in the bar, before the menu button, when they do.
   */
  readonly search?: ReactNode;
  /** The end of the bar: a `secondary` pill and a `primary` call to action with `arrow="forward"`. */
  readonly actions?: ReactNode;
  /**
   * Actions that stay in the bar when it folds, just before the menu button, such as a store's bag or a
   * notification bell, as icon buttons or small pills. Unfolded, they follow `actions`.
   */
  readonly pinned?: ReactNode;
  /**
   * `"static"` (the default) scrolls away with the page; `"sticky"` stays pinned; `"auto-hide"` slides away
   * as the page scrolls down and comes back as it scrolls up. Pinned and scrolled, it takes the `panel`
   * surface with `shadow-card`.
   */
  readonly behavior?: NavBarBehavior | undefined;
  /**
   * How it's drawn: `"plain"` (the default), across the top with no background at rest; or `"floating"`, its
   * row a rounded surface (r16, padded 16) with a shadow that deepens once the page scrolls under it, 12px
   * below the window's top and inside the page container's side padding (12px from the window's sides when
   * not contained). Its behavior, its menus and its sheet work as they do plain.
   */
  readonly variant?: NavBarVariant | undefined;
  /** Names the navigation for screen readers. Defaults to `"Main"`. */
  readonly label?: string | undefined;
  /**
   * Whether the bar sits on the page container (1200px at most, centered). Defaults to `true`; turn it off
   * for an app's own chrome, which spans its window.
   */
  readonly contained?: boolean | undefined;
  /** Names the button that opens the menu on narrow pages. Defaults to `"Menu"`. */
  readonly menuLabel?: string | undefined;
  /** Names the button that closes it. Defaults to `"Close menu"`. */
  readonly closeLabel?: string | undefined;
  /**
   * The id of the page's main content. With it, the first thing Tab reaches is a link there, shown over the
   * bar's start only while it has focus, so keyboard users can skip the bar and any navigation after it.
   */
  readonly skipTo?: string | undefined;
  /** Names the link `skipTo` adds. Defaults to `"Skip to content"`. */
  readonly skipLabel?: string | undefined;
  /** The menus and links: `MorphMenu.Item`s and `MorphMenu.Link`s. */
  readonly children?: ReactNode;
  /** Inline styles, which can include motion values. */
  readonly style?: MotionStyle | undefined;
}

/** How far the page has to scroll against its direction before an auto-hiding bar turns with it. */
const TURN = space["1"];

/** How far an auto-hiding bar slides to leave the window: its row, and for a floating one its inset and shadow. */
const HIDDEN: Readonly<Record<NavBarVariant, number>> = {
  plain: heights["nav-bar"].comfortable,
  floating: heights["nav-bar"].comfortable + space["3"] + space["8"],
};

function widthOf(element: Element | null | undefined): number {
  return element ? element.getBoundingClientRect().width : 0;
}

/** Measures what the bar's menus and actions need while they show, and whether they fit beside the brand. */
function shouldFold(row: HTMLElement, needed: RefObject<number>): boolean {
  const list = row.querySelector('[data-bt-part="list"]');
  if (list && list.getClientRects().length > 0) {
    const items = Array.from(list.children).reduce(
      (sum, item) => sum + widthOf(item),
      0,
    );
    const groups = [
      row.querySelector(':scope > [data-bt-part="nav-bar-brand"]'),
      row.querySelector(':scope > [data-bt-part="nav-bar-actions"]'),
      row.querySelector(':scope > [data-bt-part="nav-bar-pinned"]'),
    ].filter((group) => group !== null);
    const search = row.querySelector(
      ':scope > [data-bt-part="nav-bar-search"]',
    );
    const gap = Number.parseFloat(getComputedStyle(row).columnGap) || 0;
    needed.current =
      items +
      groups.reduce((sum, group) => sum + widthOf(group), 0) +
      gap * groups.length +
      (search
        ? (Number.parseFloat(getComputedStyle(search).minWidth) || 0) + gap
        : 0);
  }
  const style = getComputedStyle(row);
  const room =
    row.clientWidth -
    (Number.parseFloat(style.paddingInlineStart) || 0) -
    (Number.parseFloat(style.paddingInlineEnd) || 0);
  return room < displayBreakpoints.md || needed.current > room;
}

/**
 * Whether the bar's menus and actions fold into the menu button: under 640px of bar, or once they no longer
 * fit beside the brand. It remembers the width they needed, since folded they can't be measured, and
 * unfolds once there's room.
 */
function useFolded(bar: RefObject<HTMLElement | null>): boolean {
  const [folded, setFolded] = useState(false);
  const needed = useRef(0);

  useLayoutEffect(() => {
    const row = bar.current;
    if (!row) return undefined;
    const measure = (): void => {
      setFolded(shouldFold(row, needed));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    measure();
    return () => {
      observer.disconnect();
    };
  }, [bar]);

  // A bar folded from the start has never measured its menus; once it unfolds they can be, before paint.
  useLayoutEffect(() => {
    const row = bar.current;
    if (!folded && row) setFolded(shouldFold(row, needed));
  }, [bar, folded]);

  return folded;
}

/** Tracks the page scrolling under the bar: whether it has moved at all, and whether it's going down. */
function useScrollState(
  bar: RefObject<HTMLElement | null>,
  watching: boolean,
): { readonly scrolled: boolean; readonly down: boolean } {
  const [state, setState] = useState({ scrolled: false, down: false });
  useEffect(() => {
    const element = bar.current;
    if (!watching || !element) return undefined;
    const root = scrollRootOf(element);
    const scroller: HTMLElement | Window =
      root === document.documentElement ? window : root;
    // The furthest the page has gone in the direction it's going, so a slow scroll still adds up to a turn.
    let extreme = root.scrollTop;
    let down = false;
    let frame = 0;
    const read = (): void => {
      frame = 0;
      const top = root.scrollTop;
      if (down ? top > extreme : top < extreme) {
        extreme = top;
      } else if (down && top < extreme - TURN) {
        down = false;
        extreme = top;
      } else if (!down && top > extreme + TURN && top > element.offsetHeight) {
        down = true;
        extreme = top;
      }
      const next = { scrolled: top > 0, down };
      setState((current) =>
        next.scrolled === current.scrolled && next.down === current.down
          ? current
          : next,
      );
    };
    const schedule = (): void => {
      if (frame === 0) frame = requestAnimationFrame(read);
    };
    scroller.addEventListener("scroll", schedule, { passive: true });
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", schedule);
    };
  }, [bar, watching]);
  return state;
}

function PhoneMenu({
  label,
  menuLabel,
  closeLabel,
  brand,
  actions,
  available,
  row,
  children,
}: {
  readonly label: string;
  readonly menuLabel: string;
  readonly closeLabel: string;
  readonly brand: ReactNode;
  readonly actions: ReactNode;
  /** Whether the bar is folded, so its menu button shows. */
  readonly available: boolean;
  readonly row: RefObject<HTMLElement | null>;
  readonly children: ReactNode;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const [wasAvailable, setWasAvailable] = useState(available);
  const panel = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const reduced = useMotionPreference() === "reduced";
  const sheet = reduced ? reducedPresence : presencePresets.rise;
  const scrim = reduced ? reducedPresence : presencePresets.scrim;
  // A bar that widens past its fold puts its menus back in the row, so the sheet closes with it.
  if (available !== wasAvailable) {
    setWasAvailable(available);
    if (!available) setOpen(false);
  }
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        <IconButton
          ref={button}
          icon={MenuIcon}
          label={menuLabel}
          data-bt-part="nav-bar-menu-button"
        />
      </RadixDialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Layer band="modal" key="sheet">
            <RadixDialog.Overlay forceMount asChild>
              <motion.div
                initial={scrim.initial}
                animate={scrim.animate}
                exit={scrim.exit}
                className="bt-nav-bar-scrim"
                data-bt-part="scrim"
              >
                <Scrim />
              </motion.div>
            </RadixDialog.Overlay>
            <RadixDialog.Content
              forceMount
              asChild
              aria-describedby={undefined}
              onOpenAutoFocus={(event) => {
                // Start on the first menu rather than the close button, whose tooltip would open.
                const [first] = tabbables(body.current);
                if (!first) return;
                event.preventDefault();
                first.focus();
              }}
              onCloseAutoFocus={(event) => {
                const active = document.activeElement;
                // A link chosen in the sheet can move focus on, such as to the section it jumps to.
                if (
                  active instanceof HTMLElement &&
                  active !== document.body &&
                  panel.current?.contains(active) !== true
                ) {
                  event.preventDefault();
                  return;
                }
                // Closed by the bar unfolding, the menu button is gone; focus goes to the row's first link.
                if ((button.current?.getClientRects().length ?? 0) > 0) return;
                const [first] = tabbables(row.current);
                if (!first) return;
                event.preventDefault();
                first.focus();
              }}
            >
              <motion.div
                ref={panel}
                initial={sheet.initial}
                animate={sheet.animate}
                exit={sheet.exit}
                aria-modal="true"
                className="bt-nav-bar-sheet bt-surface"
                data-level="floating"
                data-bt-part="sheet"
                onClickCapture={(event) => {
                  if (opensElsewhere(event)) return;
                  if (!(event.target instanceof Element)) return;
                  if (!event.target.closest("a[href]")) return;
                  // The sheet lets go of focus before the link acts, so a link that moves focus keeps it there.
                  flushSync(() => {
                    setOpen(false);
                  });
                }}
              >
                <VisuallyHidden.Root asChild>
                  <RadixDialog.Title>{label}</RadixDialog.Title>
                </VisuallyHidden.Root>
                <div data-bt-part="sheet-bar">
                  {hasContent(brand) ? (
                    <div data-bt-part="nav-bar-brand">{brand}</div>
                  ) : null}
                  <RadixDialog.Close asChild>
                    <IconButton icon={X} label={closeLabel} />
                  </RadixDialog.Close>
                </div>
                <div ref={body} data-bt-part="sheet-body">
                  <MorphMenu label={label} layout="stack">
                    {children}
                  </MorphMenu>
                </div>
                {hasContent(actions) ? (
                  <div data-bt-part="sheet-actions">{actions}</div>
                ) : null}
              </motion.div>
            </RadixDialog.Content>
          </Layer>
        ) : null}
      </AnimatePresence>
    </RadixDialog.Root>
  );
}

/**
 * The bar across the top of a page: the brand at the start, the menus and links next to it, and the
 * actions at the end, 64px tall on the page container. Its menus open in one `MorphMenu` card 8px under the
 * bar, never over it, while the page behind blurs. At rest it has no background, so it sits on a hero;
 * pinned and scrolled it takes the `panel` surface. `variant="floating"` draws its row as a rounded surface
 * inset from the window's edges instead. It stacks at `--bt-z-sticky` whatever its `behavior`,
 * and while it can stay on screen it publishes its height as `--bt-sticky-top`; an auto-hiding bar also
 * publishes how far it has slid away as `--bt-sticky-shift`, for sticky followers such as `SubNav`. With
 * less than 640px of room, or once they don't fit, the menus and actions fold into a menu button that opens
 * a full-height sheet; a `search` narrows first, and stays in the bar when they fold.
 *
 * @example
 * <NavBar
 *   brand={<a href="/">Deckhand</a>}
 *   actions={<Button arrow="forward">Get started</Button>}
 *   behavior="sticky"
 * >
 *   <MorphMenu.Item label="Product">…</MorphMenu.Item>
 *   <MorphMenu.Link href="/pricing">Pricing</MorphMenu.Link>
 * </NavBar>
 */
export function NavBar({
  brand,
  search,
  actions,
  pinned,
  behavior = "static",
  variant = "plain",
  label = "Main",
  menuLabel = "Menu",
  closeLabel = "Close menu",
  skipTo,
  skipLabel = "Skip to content",
  contained = true,
  ref,
  className,
  style,
  onFocus,
  onBlur,
  children,
  ...rest
}: NavBarProps): ReactElement {
  const header = useRef<HTMLElement>(null);
  const refs = useMergedRefs(ref, header);
  const row = useRef<HTMLDivElement>(null);
  const folded = useFolded(row);
  const [menu, setMenu] = useState("");
  const [raised, setRaised] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useMotionPreference() === "reduced";
  const slide = useButteryTransition("smooth");
  const scroll = useScrollState(header, behavior !== "static");
  const hidden =
    behavior === "auto-hide" && scroll.down && menu === "" && !focused;
  const shift = useMotionValue(0);
  const scrim = reduced ? reducedPresence : presencePresets.scrim;

  useMotionValueEvent(shift, "change", (latest) => {
    const element = header.current;
    if (!element) return;
    scrollRootOf(element).style.setProperty(
      "--bt-sticky-shift",
      `${String(-latest)}px`,
    );
  });

  useEffect(() => {
    const element = header.current;
    if (behavior !== "auto-hide" || !element) return undefined;
    const root = scrollRootOf(element);
    return () => {
      root.style.removeProperty("--bt-sticky-shift");
    };
  }, [behavior]);

  const barRow = (
    <div
      ref={row}
      data-bt-part="nav-bar-bar"
      data-folded={folded ? "" : undefined}
    >
      {skipTo === undefined ? null : (
        <a href={`#${skipTo}`} className="bt-focus" data-bt-part="nav-bar-skip">
          {skipLabel}
        </a>
      )}
      {hasContent(brand) ? (
        <div data-bt-part="nav-bar-brand">{brand}</div>
      ) : null}
      <MorphMenu
        label={label}
        value={menu}
        onValueChange={(next) => {
          setMenu(next);
          if (next !== "") setRaised(true);
        }}
        data-bt-part="menu"
      >
        {children}
      </MorphMenu>
      {hasContent(search) ? (
        <div data-bt-part="nav-bar-search">{search}</div>
      ) : null}
      {hasContent(actions) ? (
        <div data-bt-part="nav-bar-actions">{actions}</div>
      ) : null}
      {hasContent(pinned) ? (
        <div data-bt-part="nav-bar-pinned">{pinned}</div>
      ) : null}
      <PhoneMenu
        label={label}
        menuLabel={menuLabel}
        closeLabel={closeLabel}
        brand={brand}
        actions={actions}
        available={folded}
        row={row}
      >
        {children}
      </PhoneMenu>
    </div>
  );

  const bar = (
    <motion.header
      {...rest}
      ref={refs}
      className={cx("bt-nav-bar", className)}
      data-bt="NavBar"
      data-behavior={behavior}
      data-variant={variant}
      data-scrolled={scroll.scrolled ? "" : undefined}
      data-raised={raised ? "" : undefined}
      style={{ ...style, y: shift }}
      onFocus={(event) => {
        onFocus?.(event);
        // Keyboard focus holds an auto-hiding bar in place; a click that happens to focus a link doesn't.
        setFocused(event.target.matches(":focus-visible"));
      }}
      onBlur={(event) => {
        onBlur?.(event);
        // Focus moving within the bar keeps it out; leaving it lets an auto-hiding bar slide away again.
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocused(false);
        }
      }}
      animate={{ y: hidden ? -HIDDEN[variant] : 0 }}
      transition={slide}
    >
      {contained ? <Container>{barRow}</Container> : barRow}
      <AnimatePresence
        onExitComplete={() => {
          setRaised(false);
        }}
      >
        {menu === "" ? null : (
          <Layer band="scrim-nav" key="scrim">
            <motion.div
              initial={scrim.initial}
              animate={scrim.animate}
              exit={scrim.exit}
              className="bt-nav-bar-scrim"
              data-bt-part="scrim"
            >
              <Scrim variant="blur" />
            </motion.div>
          </Layer>
        )}
      </AnimatePresence>
    </motion.header>
  );

  return behavior === "static" ? bar : <Sticky asChild>{bar}</Sticky>;
}
