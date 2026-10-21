import {
  Layer,
  Scrim,
  Sticky,
  cx,
  hasContent,
  heights,
  presencePresets,
  reducedPresence,
  scrollRootOf,
  useButteryTransition,
  useMergedRefs,
  useMotionPreference,
} from "@buttery/core";
import { Menu as MenuIcon, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
} from "motion/react";
import { Dialog as RadixDialog, VisuallyHidden } from "radix-ui";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

/** Props for `NavBar`. */
export interface NavBarProps extends Omit<
  ComponentPropsWithRef<"header">,
  "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd" | "style"
> {
  /** The start of the bar: the product's mark and name, usually a link home. */
  readonly brand?: ReactNode;
  /** The end of the bar: a `secondary` pill and a `primary` call to action with `arrow="forward"`. */
  readonly actions?: ReactNode;
  /**
   * `"static"` (the default) scrolls away with the page; `"sticky"` stays pinned; `"auto-hide"` slides away
   * as the page scrolls down and comes back as it scrolls up. Pinned and scrolled, it takes the `panel`
   * surface with `shadow-card`.
   */
  readonly behavior?: NavBarBehavior | undefined;
  /** Names the navigation for screen readers. Defaults to `"Main"`. */
  readonly label?: string | undefined;
  /** Names the button that opens the menu on narrow pages. Defaults to `"Menu"`. */
  readonly menuLabel?: string | undefined;
  /** Names the button that closes it. Defaults to `"Close menu"`. */
  readonly closeLabel?: string | undefined;
  /** The menus and links: `MorphMenu.Item`s and `MorphMenu.Link`s. */
  readonly children?: ReactNode;
}

const GAP = 24;

function widthOf(element: Element | null | undefined): number {
  return element ? element.getBoundingClientRect().width : 0;
}

/**
 * Whether the bar's menus and actions no longer fit beside the brand, so they fold into the menu button. It
 * remembers the width they needed, since folded they can't be measured, and unfolds once there's room.
 */
function useFolded(bar: RefObject<HTMLElement | null>): boolean {
  const [folded, setFolded] = useState(false);
  const needed = useRef(0);
  useLayoutEffect(() => {
    const row = bar.current;
    if (!row) return undefined;
    const measure = (): void => {
      const list = row.querySelector('[data-bt-part="list"]');
      if (list && list.getClientRects().length > 0) {
        const items = Array.from(list.children).reduce(
          (sum, item) => sum + widthOf(item),
          0,
        );
        const groups = [
          row.querySelector(':scope > [data-bt-part="brand"]'),
          row.querySelector(':scope > [data-bt-part="actions"]'),
        ].filter((group) => group !== null);
        needed.current =
          items +
          groups.reduce((sum, group) => sum + widthOf(group), 0) +
          GAP * groups.length;
      }
      setFolded(needed.current > row.clientWidth);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    measure();
    return () => {
      observer.disconnect();
    };
  }, [bar]);
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
    let last = root.scrollTop;
    let frame = 0;
    const read = (): void => {
      frame = 0;
      const top = root.scrollTop;
      const scrolled = top > 0;
      const down =
        top > last + 4 && top > element.offsetHeight
          ? true
          : top < last - 4
            ? false
            : null;
      last = top;
      setState((current) => {
        const next = { scrolled, down: down ?? current.down };
        return next.scrolled === current.scrolled && next.down === current.down
          ? current
          : next;
      });
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
  children,
}: {
  readonly label: string;
  readonly menuLabel: string;
  readonly closeLabel: string;
  readonly brand: ReactNode;
  readonly actions: ReactNode;
  readonly children: ReactNode;
}): ReactElement {
  const [open, setOpen] = useState(false);
  const reduced = useMotionPreference() === "reduced";
  const sheet = reduced ? reducedPresence : presencePresets.rise;
  return (
    <RadixDialog.Root open={open} onOpenChange={setOpen}>
      <RadixDialog.Trigger asChild>
        <IconButton
          icon={MenuIcon}
          label={menuLabel}
          data-bt-part="menu-button"
        />
      </RadixDialog.Trigger>
      <AnimatePresence>
        {open ? (
          <Layer band="modal" key="sheet">
            <RadixDialog.Content
              forceMount
              asChild
              aria-describedby={undefined}
            >
              <motion.div
                initial={sheet.initial}
                animate={sheet.animate}
                exit={sheet.exit}
                aria-modal="true"
                className="bt-nav-bar-sheet bt-surface"
                data-level="floating"
                data-bt-part="sheet"
              >
                <VisuallyHidden.Root asChild>
                  <RadixDialog.Title>{label}</RadixDialog.Title>
                </VisuallyHidden.Root>
                <div data-bt-part="sheet-bar">
                  {hasContent(brand) ? (
                    <div data-bt-part="brand">{brand}</div>
                  ) : null}
                  <RadixDialog.Close asChild>
                    <IconButton icon={X} label={closeLabel} />
                  </RadixDialog.Close>
                </div>
                <div data-bt-part="sheet-body">
                  <MorphMenu label={label} layout="stack">
                    {children}
                  </MorphMenu>
                  {hasContent(actions) ? (
                    <div data-bt-part="sheet-actions">{actions}</div>
                  ) : null}
                </div>
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
 * actions at the end, 64px tall on the page container. Its menus open in one `MorphMenu` panel that reaches
 * up behind the bar, while the page behind blurs. At rest it has no background, so it sits on a hero;
 * pinned and scrolled it takes the `panel` surface. It stacks at `--bt-z-sticky` whatever its `behavior`,
 * and while it can stay on screen it publishes its height as `--bt-sticky-top`; an auto-hiding bar also
 * publishes how far it has slid away as `--bt-sticky-shift`, for sticky followers such as `SubNav`. With
 * less than 640px of room, the menus and actions fold into a menu button that opens a full-height sheet.
 *
 * @example
 * <NavBar
 *   brand={<a href="/">Card Studio</a>}
 *   actions={<Button arrow="forward">Get started</Button>}
 *   behavior="sticky"
 * >
 *   <MorphMenu.Item label="Product">…</MorphMenu.Item>
 *   <MorphMenu.Link href="/pricing">Pricing</MorphMenu.Link>
 * </NavBar>
 */
export function NavBar({
  brand,
  actions,
  behavior = "static",
  label = "Main",
  menuLabel = "Menu",
  closeLabel = "Close menu",
  ref,
  className,
  children,
  ...rest
}: NavBarProps): ReactElement {
  const header = useRef<HTMLElement>(null);
  const refs = useMergedRefs(ref, header);
  const row = useRef<HTMLDivElement>(null);
  const folded = useFolded(row);
  const [menu, setMenu] = useState("");
  const [raised, setRaised] = useState(false);
  const reduced = useMotionPreference() === "reduced";
  const slide = useButteryTransition("smooth");
  const scroll = useScrollState(header, behavior !== "static");
  const hidden = behavior === "auto-hide" && scroll.down && menu === "";
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

  const bar = (
    <motion.header
      {...rest}
      ref={refs}
      className={cx("bt-nav-bar", className)}
      data-bt="NavBar"
      data-behavior={behavior}
      data-scrolled={scroll.scrolled ? "" : undefined}
      data-raised={raised ? "" : undefined}
      style={{ y: shift }}
      animate={{ y: hidden ? -heights["nav-bar"].comfortable : 0 }}
      transition={slide}
    >
      <Container>
        <div ref={row} data-bt-part="bar" data-folded={folded ? "" : undefined}>
          {hasContent(brand) ? <div data-bt-part="brand">{brand}</div> : null}
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
          {hasContent(actions) ? (
            <div data-bt-part="actions">{actions}</div>
          ) : null}
          <PhoneMenu
            label={label}
            menuLabel={menuLabel}
            closeLabel={closeLabel}
            brand={brand}
            actions={actions}
          >
            {children}
          </PhoneMenu>
        </div>
      </Container>
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
