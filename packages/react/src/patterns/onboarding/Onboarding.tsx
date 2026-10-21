import {
  Morph,
  TextStack,
  cx,
  isTypingField,
  reducedTransition,
  spring,
  timing,
  useControllableState,
  useLayoutAnimation,
  useMotionPreference,
} from "@buttery/core";
import type { MotionElementProps } from "@buttery/core";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { createContext, use, useEffect, useId, useState } from "react";
import type {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
  Ref,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { celebrate } from "../../components/confetti/Confetti.tsx";
import { Dialog } from "../../components/dialog/Dialog.tsx";
import { PageDots } from "../../components/page-dots/PageDots.tsx";

/** One step of an onboarding. */
export interface OnboardingStep {
  /** The step's title. While the step shows, it names the dialog. */
  readonly title: string;
  /** A line or two about the step. */
  readonly body: ReactNode;
  /** A short note under the body, such as a keyboard tip. */
  readonly caption?: ReactNode;
  /** The step's scene, drawn 384×200. Pieces that carry over to the next step go in `Onboarding.Shared`. */
  readonly media: ReactNode;
  /** The scene's background, such as a palette gradient. It crossfades between steps. */
  readonly background?: string | undefined;
}

/** The words an `Onboarding` uses, for other languages. */
export interface OnboardingLabels {
  /** The button that goes back a step. */
  readonly back: string;
  /** The button that goes on to the next step. */
  readonly next: string;
  /** The forward button's label on the last step, which finishes. */
  readonly finish: string;
  /** Names the close button. */
  readonly close: string;
  /** Says which step shows, for the page dots and as each step arrives. */
  readonly step: (step: number, count: number) => string;
}

/** Props for `Onboarding`. */
export interface OnboardingProps {
  /** The steps, in order. */
  readonly steps: readonly OnboardingStep[];
  /** Whether it's open. Pair with `onOpenChange` to control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts open when uncontrolled. Defaults to `false`, or to `true` the first time with a `storageKey`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it opens or closes. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Remembers in local storage that it was finished or closed, under this key. With one, it opens by itself
   * the first time and never again.
   */
  readonly storageKey?: string | undefined;
  /** Called when the last step's button finishes it, as the confetti flies. */
  readonly onFinish?: (() => void) | undefined;
  /** Words to use instead of the English ones. */
  readonly labels?: Partial<OnboardingLabels> | undefined;
  /** The onboarding's content inside the dialog. */
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Extra classes for the onboarding's content. */
  readonly className?: string | undefined;
}

const LABELS: OnboardingLabels = {
  back: "Back",
  next: "Next",
  finish: "Done",
  close: "Close",
  step: (step, count) => `Step ${String(step + 1)} of ${String(count)}`,
};

const STORAGE_PREFIX = "buttery:onboarding:";

function storageKeyOf(key: string): string {
  return `${STORAGE_PREFIX}${key}`;
}

function isDone(key: string | undefined): boolean {
  if (key === undefined) return false;
  try {
    return window.localStorage.getItem(storageKeyOf(key)) === "done";
  } catch {
    return false;
  }
}

function remember(key: string | undefined): void {
  if (key === undefined) return;
  try {
    window.localStorage.setItem(storageKeyOf(key), "done");
  } catch {
    // Storage can be off (a private window); the onboarding then just shows again next time.
  }
}

/**
 * Whether an onboarding with this `storageKey` was finished or closed before, for an app that controls when
 * it opens: open it at first only when this is `false`.
 */
export function hasSeenOnboarding(storageKey: string): boolean {
  return isDone(storageKey);
}

const SharedScope = createContext("");

/** Props for `Onboarding.Shared`. */
export interface OnboardingSharedProps extends MotionElementProps<"div"> {
  /** Names the piece across steps: a piece with the same id in the next step's scene is the same piece, moved. */
  readonly id: string;
  /** How far the piece is turned in this step, in degrees. Defaults to 0. */
  readonly rotate?: number | undefined;
  /** How big the piece is in this step, as a scale. Defaults to 1. */
  readonly scale?: number | undefined;
}

/**
 * A piece of a scene that carries over between steps, such as a card that moves, grows or turns: give it
 * the same `id` in each step's scene, with that step's `rotate` and `scale`, and it travels there on
 * `spring.smooth` instead of fading out and in.
 */
export function OnboardingShared({
  id,
  rotate = 0,
  scale = 1,
  ...rest
}: OnboardingSharedProps): ReactElement {
  const scope = use(SharedScope);
  const { layout, transition } = useLayoutAnimation("smooth");
  return (
    <motion.div
      {...rest}
      {...(layout ? { layoutId: `${scope}-${id}` } : {})}
      initial={false}
      animate={{ rotate, scale }}
      transition={transition}
      data-bt-part="shared"
    />
  );
}

function OnboardingRoot({
  steps,
  open,
  defaultOpen,
  onOpenChange,
  storageKey,
  onFinish,
  labels,
  ref,
  className,
}: OnboardingProps): ReactElement {
  const words = { ...LABELS, ...labels };
  const [firstRun] = useState(
    () => storageKey !== undefined && !isDone(storageKey),
  );
  const [step, setStep] = useState(0);
  const [heard, setHeard] = useState("");
  const [finishing, setFinishing] = useState(false);
  const reduced = useMotionPreference() === "reduced";
  const scope = useId();
  const [isOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? firstRun,
    onChange: (next: boolean) => {
      if (next) {
        setStep(0);
        setHeard("");
      } else {
        remember(storageKey);
      }
      onOpenChange?.(next);
    },
  });
  const count = steps.length;
  const current = steps[Math.min(step, count - 1)];
  const last = step >= count - 1;

  useEffect(() => {
    if (!finishing) return undefined;
    const timer = window.setTimeout(
      () => {
        setFinishing(false);
        setOpen(false);
      },
      reduced ? 0 : timing.celebration,
    );
    return () => {
      window.clearTimeout(timer);
    };
  }, [finishing, reduced, setOpen]);

  const go = (next: number): void => {
    const target = Math.min(Math.max(next, 0), count - 1);
    if (target === step) return;
    setStep(target);
    const title = steps[target]?.title ?? "";
    setHeard(`${words.step(target, count)}: ${title}`);
  };

  const finish = (event: MouseEvent<HTMLButtonElement>): void => {
    if (finishing) return;
    celebrate(event.currentTarget);
    remember(storageKey);
    onFinish?.();
    setFinishing(true);
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (isTypingField(event.target)) return;
    if (event.key === "ArrowRight") go(step + 1);
    else if (event.key === "ArrowLeft") go(step - 1);
  };

  const fade = reduced ? reducedTransition : { opacity: spring.smooth };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <Dialog.Content
        label={current?.title}
        description={current?.body}
        closeLabel={words.close}
        onKeyDown={keyDown}
      >
        <div
          ref={ref}
          className={cx("bt-onboarding", className)}
          data-bt="Onboarding"
        >
          <Dialog.Media aria-hidden="true">
            <div data-bt-part="scene">
              <AnimatePresence initial={false}>
                <motion.div
                  key={step}
                  data-bt-part="backdrop"
                  style={{ background: current?.background }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: fade }}
                  exit={{ opacity: 0, transition: fade }}
                />
              </AnimatePresence>
              <SharedScope value={scope}>
                <LayoutGroup id={scope}>
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={step}
                      data-bt-part="stage"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: fade }}
                      exit={{ opacity: 0, transition: fade }}
                    >
                      {current?.media}
                    </motion.div>
                  </AnimatePresence>
                </LayoutGroup>
              </SharedScope>
            </div>
          </Dialog.Media>
          <Morph contentKey={step} className="bt-onboarding-text">
            <TextStack
              className="bt-dialog-text"
              title={current?.title}
              body={current?.body}
              caption={current?.caption}
              titleAs="p"
            />
          </Morph>
          <div data-bt-part="dots">
            <PageDots count={count} value={step} label={words.step} />
          </div>
          <VisuallyHidden.Root aria-live="polite">{heard}</VisuallyHidden.Root>
          <Dialog.Actions>
            <Button
              variant="soft"
              size="cta"
              shape="rounded"
              arrow="back"
              aria-disabled={step === 0}
              onClick={() => {
                go(step - 1);
              }}
            >
              {words.back}
            </Button>
            <Button
              variant="primary"
              size="cta"
              shape="rounded"
              arrow={last ? undefined : "forward"}
              aria-disabled={finishing}
              onClick={(event) => {
                if (last) finish(event);
                else go(step + 1);
              }}
            >
              <span data-bt-part="labels">
                <span data-active={last ? undefined : ""} aria-hidden={last}>
                  {words.next}
                </span>
                <span data-active={last ? "" : undefined} aria-hidden={!last}>
                  {words.finish}
                </span>
              </span>
            </Button>
          </Dialog.Actions>
        </div>
      </Dialog.Content>
    </Dialog>
  );
}

/** `Onboarding` with its parts. */
export interface OnboardingComponent {
  (props: OnboardingProps): ReactElement;
  /** A piece of a scene that carries over between steps. */
  readonly Shared: typeof OnboardingShared;
}

/**
 * A few steps in a dialog: a 384×200 scene whose shared pieces move between steps on `spring.smooth` while
 * its background crossfades, the title, body and caption crossfading in place, page dots, a Back button
 * (quiet on the first step) and a forward button that becomes the finish button on the last step, which
 * sends up confetti and closes the dialog once it's flown. Left and right arrows move between steps too.
 * With a `storageKey` it opens by itself the first time and remembers once it's finished or closed.
 *
 * @example
 * <Onboarding
 *   storageKey="card-studio"
 *   steps={[
 *     { title: "Start with a title", body: "Type it right on the card.", media: <TitleScene /> },
 *     { title: "Dress the card", body: "Pick a finish and a backdrop.", media: <FinishScene /> },
 *   ]}
 * />
 */
export const Onboarding: OnboardingComponent = Object.assign(OnboardingRoot, {
  Shared: OnboardingShared,
});
