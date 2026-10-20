import { Divider } from "@buttery/core";
import type { IconComponentProps } from "@buttery/core";
import { useLayoutEffect, useRef, useState } from "react";
import type {
  ComponentType,
  ReactElement,
  RefObject,
  SubmitEvent,
} from "react";
import { Button } from "../../components/button/Button.tsx";
import { Callout } from "../../components/callout/Callout.tsx";

/** A field that needs fixing, for the error summary: the field's id and what to do about it. */
export interface AuthProblem {
  /** The field's id, which the summary links to. */
  readonly field: string;
  /** What to fix, such as "Enter your email address". */
  readonly message: string;
}

/** Another way to sign in or sign up: a button under the form, named by its text alone. */
export interface AuthProvider {
  /** Identifies it among the others. */
  readonly id: string;
  /** What the button says, such as "Continue with a passkey". */
  readonly label: string;
  /** A generic icon for it, such as `KeyRound` from lucide-react. Never someone's brand mark. */
  readonly icon?: ComponentType<IconComponentProps> | undefined;
  /** Runs when the button is pressed. */
  readonly onSelect: () => void;
}

/**
 * What a form's `onSubmit` returns: nothing when it worked, or a message to show over the form, such as
 * "That email and password don't match". It can return either through a promise; the button shows it's
 * busy until it settles.
 */
export type AuthSubmitResult = string | undefined;

/** A form's submit handler: given the values once they pass the form's checks. */
export type AuthSubmit<Values> = (
  values: Values,
) => AuthSubmitResult | Promise<AuthSubmitResult>;

/** What `useAuthForm` hands a form. */
export interface AuthForm {
  /** The fields that need fixing now, once a submit has been tried, for the fields' own errors. */
  readonly problems: readonly AuthProblem[];
  /** The fields that needed fixing at the last submit, for the summary, which holds still until the next. */
  readonly reported: readonly AuthProblem[];
  /** The message from a submit that didn't work. */
  readonly failure: string | undefined;
  /** Whether a submit is running. */
  readonly pending: boolean;
  /** The form's submit handler. */
  readonly submit: (event: SubmitEvent<HTMLFormElement>) => void;
  /** The error summary, which takes focus when it appears. */
  readonly summary: RefObject<HTMLDivElement | null>;
  /** The message for one field, if it needs fixing. */
  readonly errorFor: (field: string) => string | undefined;
}

/**
 * A sign-in or sign-up form's submit: it checks the values, and either shows what to fix with focus on the
 * summary, or hands them to `onSubmit` and shows its message if it returns one.
 */
export function useAuthForm<Values>(
  values: Values,
  check: (values: Values) => readonly AuthProblem[],
  onSubmit: AuthSubmit<Values>,
): AuthForm {
  const [tried, setTried] = useState(false);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<string | undefined>(undefined);
  const [reported, setReported] = useState<readonly AuthProblem[]>([]);
  const [focusRequest, setFocusRequest] = useState(0);
  const summary = useRef<HTMLDivElement>(null);
  const problems = tried ? check(values) : [];

  useLayoutEffect(() => {
    if (focusRequest > 0) summary.current?.focus();
  }, [focusRequest]);

  const run = async (): Promise<void> => {
    setPending(true);
    setFailure(undefined);
    try {
      const result = await onSubmit(values);
      if (result !== undefined) {
        setFailure(result);
        setFocusRequest((count) => count + 1);
      }
    } finally {
      setPending(false);
    }
  };

  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (pending) return;
    setTried(true);
    const found = check(values);
    setReported(found);
    if (found.length > 0) {
      setFailure(undefined);
      setFocusRequest((count) => count + 1);
      return;
    }
    void run();
  };

  return {
    problems,
    reported,
    failure,
    pending,
    submit,
    summary,
    errorFor: (field) =>
      problems.find((problem) => problem.field === field)?.message,
  };
}

/** The summary over a form: a danger callout that's read out, with a link to each field that needs fixing. */
export function AuthErrorSummary({
  title,
  form,
}: {
  readonly title: string;
  readonly form: AuthForm;
}): ReactElement | null {
  const { reported: problems, failure, summary } = form;
  if (problems.length === 0 && failure === undefined) return null;
  return (
    <Callout
      ref={summary}
      tone="danger"
      title={title}
      role="alert"
      tabIndex={-1}
      data-bt-part="summary"
    >
      {failure === undefined ? null : <p>{failure}</p>}
      {problems.length > 0 ? (
        <ul>
          {problems.map((problem) => (
            <li key={problem.field}>
              <a
                href={`#${problem.field}`}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(problem.field)?.focus();
                }}
              >
                {problem.message}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </Callout>
  );
}

/** Other ways in, under an "or" rule: a full-width soft button for each. */
export function AuthProviders({
  or,
  providers,
}: {
  readonly or: string;
  readonly providers: readonly AuthProvider[];
}): ReactElement | null {
  if (providers.length === 0) return null;
  return (
    <>
      <div data-bt-part="or">
        <Divider decorative />
        <span className="bt-text" data-role="caption">
          {or}
        </span>
        <Divider decorative />
      </div>
      <div data-bt-part="providers">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="soft"
            size="cta"
            shape="rounded"
            iconStart={provider.icon}
            onClick={provider.onSelect}
          >
            {provider.label}
          </Button>
        ))}
      </div>
    </>
  );
}

/** Whether a string looks like an email address: something, an @, something with a dot. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
