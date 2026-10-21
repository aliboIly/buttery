import {
  FloatingLanes,
  Icon,
  Morph,
  Text,
  cx,
  presencePresets,
  reducedPresence,
  useAnimationTracking,
  useButteryTransition,
  useMotionPreference,
  useStoredState,
} from "@buttery/core";
import type { MotionElementProps } from "@buttery/core";
import { ChevronDown, ChevronUp, Circle, CircleCheck, X } from "lucide-react";
import { motion } from "motion/react";
import { VisuallyHidden } from "radix-ui";
import { useId } from "react";
import type { ReactElement } from "react";
import { Button } from "../../components/button/Button.tsx";
import { IconButton } from "../../components/icon-button/IconButton.tsx";
import { useDismissible } from "../../parts/guidance/GuidanceParts.tsx";
import type { GuidanceAction } from "../../parts/guidance/GuidanceParts.tsx";

/** One task in a setup guide. */
export interface SetupTask {
  /** Identifies the task among the others. */
  readonly id: string;
  /** What to do, such as "Add your first coffee". */
  readonly title: string;
  /** A line more about it, under the title when the guide is unfolded. */
  readonly description?: string | undefined;
  /** Whether it's done. The app knows; the guide shows it. */
  readonly done?: boolean | undefined;
  /** Where to do it: the "Next:" link takes the task's title, and the unfolded guide shows this as a button. */
  readonly action?: GuidanceAction | undefined;
}

/** The words a `SetupGuide` shows and announces. */
export interface SetupGuideLabels {
  /** Before the next task when folded. */
  readonly next: string;
  /** Names the button that unfolds it. */
  readonly expand: string;
  /** Names the button that folds it. */
  readonly collapse: string;
  /** Names the dismiss button. */
  readonly dismiss: string;
  /** Takes the place of the next task once every task is done. */
  readonly allDone: string;
  /** Read before a done task's title. */
  readonly done: string;
  /** Read before a task still to do. */
  readonly toDo: string;
  /** The progress, read with the bar, such as "2 of 5 done". */
  readonly progress: (done: number, total: number) => string;
}

/** Props for `SetupGuide`. */
export interface SetupGuideProps extends Omit<
  MotionElementProps<"div">,
  "title"
> {
  /** What it's for. Defaults to `"Setup guide"`. It names the guide. */
  readonly title?: string | undefined;
  /** The tasks, in the order to do them. The first one not done is next. */
  readonly tasks: readonly SetupTask[];
  /** Whether it's unfolded, when you control it. */
  readonly open?: boolean | undefined;
  /** Whether it starts unfolded. Defaults to `false`. */
  readonly defaultOpen?: boolean | undefined;
  /** Called when it unfolds or folds. */
  readonly onOpenChange?: ((open: boolean) => void) | undefined;
  /** Remembers whether it's unfolded and whether it was dismissed under this key, across visits. */
  readonly storageKey?: string | undefined;
  /** Called once it has faded and gone. */
  readonly onDismiss?: (() => void) | undefined;
  /** Its words, for another language or your own. */
  readonly labels?: Partial<SetupGuideLabels> | undefined;
}

const LABELS: SetupGuideLabels = {
  next: "Next:",
  expand: "Show all steps",
  collapse: "Hide steps",
  dismiss: "Dismiss",
  allDone: "You're all set.",
  done: "Done",
  toDo: "To do",
  progress: (done, total) => `${String(done)} of ${String(total)} done`,
};

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function TaskLink({ task }: { readonly task: SetupTask }): ReactElement {
  const { action } = task;
  if (action?.href !== undefined)
    return (
      <a
        href={action.href}
        onClick={action.onClick}
        className="bt-focus"
        data-bt-part="next-link"
      >
        {task.title}
      </a>
    );
  if (action?.onClick !== undefined)
    return (
      <button
        type="button"
        onClick={action.onClick}
        className="bt-focus"
        data-bt-part="next-link"
      >
        {task.title}
      </button>
    );
  return <span data-bt-part="next-title">{task.title}</span>;
}

/**
 * A floating checklist for getting started, in the `bottom-end` lane: 288 wide, it rises in as toasts do.
 * Folded, it shows its title, a progress bar and the next task as a link; unfolded, its height opens on
 * `spring.smooth` to every task with a check, the next one with its action as a button. With a
 * `storageKey` it remembers being unfolded and being dismissed across visits; which tasks are done comes
 * from the app.
 *
 * @example
 * <SetupGuide
 *   storageKey="roastery-setup"
 *   tasks={[
 *     { id: "coffee", title: "Add your first coffee", done: true },
 *     { id: "shipping", title: "Set shipping rates", action: { label: "Set rates", href: "/settings/shipping" } },
 *   ]}
 * />
 */
export function SetupGuide({
  title = "Setup guide",
  tasks,
  open,
  defaultOpen = false,
  onOpenChange,
  storageKey,
  onDismiss,
  labels,
  className,
  ...rest
}: SetupGuideProps): ReactElement | null {
  const words = { ...LABELS, ...labels };
  const titleId = useId();
  const stepsId = useId();
  const reduced = useMotionPreference() === "reduced";
  const smooth = useButteryTransition("smooth");
  const arrivalTracking = useAnimationTracking();
  const fillTracking = useAnimationTracking();
  const [stored, setStored] = useStoredState(
    storageKey === undefined
      ? undefined
      : `buttery:setup-guide-open:${storageKey}`,
    defaultOpen,
    isFlag,
  );
  const unfolded = open ?? stored;
  const { dismissed, dismiss, motionProps } = useDismissible({
    kind: "setup-guide",
    storageKey,
    onDismiss,
  });
  if (dismissed) return null;
  const total = tasks.length;
  const finished = tasks.filter((task) => task.done === true).length;
  const next = tasks.find((task) => task.done !== true);
  const arrival = reduced ? reducedPresence : presencePresets.toast;

  const toggle = (): void => {
    const change = !unfolded;
    if (open === undefined) setStored(change);
    onOpenChange?.(change);
  };

  return (
    <FloatingLanes.Item lane="bottom-end">
      <motion.div
        {...arrivalTracking}
        initial={arrival.initial}
        animate={arrival.animate}
        data-bt-part="arrival"
      >
        <motion.div
          role="region"
          aria-labelledby={titleId}
          {...rest}
          {...motionProps}
          className={cx("bt-setup-guide", className)}
          data-bt="SetupGuide"
        >
          <div data-bt-part="head">
            <Text id={titleId} variant="title-sm">
              {title}
            </Text>
            <div data-bt-part="controls">
              <IconButton
                icon={unfolded ? ChevronDown : ChevronUp}
                label={unfolded ? words.collapse : words.expand}
                size="sm"
                aria-expanded={unfolded}
                aria-controls={unfolded ? stepsId : undefined}
                onClick={toggle}
              />
              <IconButton
                icon={X}
                label={words.dismiss}
                size="sm"
                onClick={dismiss}
              />
            </div>
          </div>
          <div
            role="progressbar"
            aria-labelledby={titleId}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={finished}
            aria-valuetext={words.progress(finished, total)}
            data-bt-part="progress"
          >
            <motion.span
              {...fillTracking}
              data-bt-part="fill"
              initial={false}
              animate={{ scaleX: total === 0 ? 0 : finished / total }}
              transition={smooth}
            />
          </div>
          <Morph contentKey={unfolded ? "steps" : "next"}>
            {unfolded ? (
              <ol id={stepsId} className="bt-scroll-fade" data-bt-part="steps">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    data-bt-part="step"
                    data-done={task.done === true ? "" : undefined}
                  >
                    <Icon
                      icon={task.done === true ? CircleCheck : Circle}
                      data-bt-part="check"
                    />
                    <div data-bt-part="step-text">
                      <Text>
                        <VisuallyHidden.Root>
                          {`${task.done === true ? words.done : words.toDo}: `}
                        </VisuallyHidden.Root>
                        {task.title}
                      </Text>
                      {task.description === undefined ? null : (
                        <Text variant="body-sm">{task.description}</Text>
                      )}
                      {task !== next || task.action === undefined ? null : (
                        <span data-bt-part="step-action">
                          {task.action.href === undefined ? (
                            <Button
                              variant="soft"
                              size="sm"
                              onClick={task.action.onClick}
                            >
                              {task.action.label}
                            </Button>
                          ) : (
                            <Button variant="soft" size="sm" asChild>
                              <a
                                href={task.action.href}
                                onClick={task.action.onClick}
                              >
                                {task.action.label}
                              </a>
                            </Button>
                          )}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="bt-text" data-role="caption" data-bt-part="next">
                {next === undefined ? (
                  words.allDone
                ) : (
                  <>
                    {`${words.next} `}
                    <TaskLink task={next} />
                  </>
                )}
              </p>
            )}
          </Morph>
        </motion.div>
      </motion.div>
    </FloatingLanes.Item>
  );
}
