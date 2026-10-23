import { useEffect, useRef, useState } from "react";
import type { MouseEvent, ReactElement, ReactNode, SubmitEvent } from "react";
import {
  Inline,
  Menu,
  Morph,
  Stack,
  TextStack,
  useStoredState,
} from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import {
  ArrowLink,
  Button,
  Dialog,
  SignInForm,
  SignUpForm,
  TextField,
  looksLikeEmail,
  toast,
} from "@buttery/react";
import { LogOut, Repeat, UserRound } from "lucide-react";
import { firstName } from "./plan.ts";
import { STORAGE_PREFIX } from "./storage.ts";

function isAccount(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** The email of the customer signed in on this browser, or `null`, kept across visits. */
export function useAccount(): readonly [
  string | null,
  StoredStateSetter<string | null>,
] {
  return useStoredState<string | null>(
    `${STORAGE_PREFIX}:account`,
    null,
    isAccount,
  );
}

type AccountStep = "sign-in" | "sign-up" | "reset";

/** The step each of the forms' own links leads to, by the link's `href`. */
const STEP_LINKS: Readonly<Partial<Record<string, AccountStep>>> = {
  "#sign-in": "sign-in",
  "#create-account": "sign-up",
  "#reset-password": "reset",
};

const STEP_LABELS: Readonly<Record<AccountStep, string>> = {
  "sign-in": "Sign in",
  "sign-up": "Create an account",
  reset: "Reset your password",
};

/** Stands in for the round trip to a server, so the button shows it's busy. */
function pause(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 400);
  });
}

/** Focuses the first field inside it as it arrives, since the link that brought it there has gone. */
function FocusOnArrival({
  active,
  children,
}: {
  readonly active: boolean;
  readonly children: ReactNode;
}): ReactElement {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (active) box.current?.querySelector("input")?.focus();
  }, [active]);
  return <div ref={box}>{children}</div>;
}

function ResetForm({
  onSent,
  onBack,
}: {
  readonly onSent: (email: string) => void;
  readonly onBack: () => void;
}): ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [sending, setSending] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const submit = (event: SubmitEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const value = email.trim();
    const problem =
      value === ""
        ? "Enter the email you signed up with."
        : looksLikeEmail(value)
          ? undefined
          : "Enter an email address like name@example.com.";
    setError(problem);
    if (problem !== undefined) {
      field.current?.focus();
      return;
    }
    setSending(true);
    void pause().then(() => {
      onSent(value);
    });
  };
  return (
    <form onSubmit={submit} noValidate aria-label="Reset your password">
      <Stack gap={5}>
        <TextStack
          titleAs="h2"
          title="Reset your password"
          body="We'll email you a link to choose a new one."
        />
        <TextField
          ref={field}
          name="email"
          label="Email"
          type="email"
          size="lg"
          autoComplete="username"
          inputMode="email"
          value={email}
          error={error}
          onValueChange={(next) => {
            setEmail(next);
            setError(undefined);
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="cta"
          shape="rounded"
          loading={sending}
        >
          Email me a link
        </Button>
        <Inline justify="center">
          <ArrowLink
            href="#sign-in"
            arrow="back"
            onClick={(event) => {
              event.preventDefault();
              onBack();
            }}
          >
            Back to sign in
          </ArrowLink>
        </Inline>
      </Stack>
    </form>
  );
}

/**
 * Signing in, in a dialog, which changes in place to creating an account or resetting a password when one
 * of the form's links asks for it.
 */
export function SignInDialog({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  const [, setAccount] = useAccount();
  const [step, setStep] = useState<AccountStep>("sign-in");
  const [moved, setMoved] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("sign-in");
      setMoved(false);
    }
  }

  const follow = (event: MouseEvent<HTMLElement>): void => {
    if (!(event.target instanceof Element)) return;
    const href = event.target.closest("a")?.getAttribute("href");
    const next =
      href === null || href === undefined ? undefined : STEP_LINKS[href];
    if (next === undefined) return;
    event.preventDefault();
    setStep(next);
    setMoved(true);
  };
  const signIn = (email: string, message: string): void => {
    setAccount(email);
    onOpenChange(false);
    toast.success(message, { id: "account" });
  };

  let content: ReactElement;
  switch (step) {
    case "sign-in":
      content = (
        <SignInForm
          titleAs="h2"
          title="Sign in to Halfmoon"
          description="See your orders and change your subscription."
          forgotPasswordHref="#reset-password"
          signUpHref="#create-account"
          onClick={follow}
          onSubmit={async ({ email }) => {
            await pause();
            signIn(email, `Signed in as ${email}.`);
            return undefined;
          }}
        />
      );
      break;
    case "sign-up":
      content = (
        <SignUpForm
          titleAs="h2"
          title="Create your Halfmoon account"
          description="Follow your orders and run your subscription in one place."
          signInHref="#sign-in"
          onClick={follow}
          onSubmit={async ({ name, email }) => {
            await pause();
            signIn(email, `Welcome to Halfmoon, ${firstName(name)}.`);
            return undefined;
          }}
        />
      );
      break;
    case "reset":
      content = (
        <ResetForm
          onSent={(email) => {
            onOpenChange(false);
            toast.success(`We sent a link to ${email}.`, { id: "account" });
          }}
          onBack={() => {
            setStep("sign-in");
            setMoved(true);
          }}
        />
      );
      break;
    default: {
      const unknown: never = step;
      content = unknown;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content label={STEP_LABELS[step]} className="shop-dialog">
        <Dialog.Body>
          <Morph contentKey={step}>
            <FocusOnArrival active={moved}>{content}</FocusOnArrival>
          </Morph>
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
}

/**
 * The bar's account action: a Sign in link, which in the bar's sheet closes the sheet before the dialog
 * opens, or once signed in, a menu with the subscription and Sign out.
 */
export function AccountAction({
  onSignIn,
  onSubscription,
}: {
  readonly onSignIn: () => void;
  readonly onSubscription: () => void;
}): ReactElement {
  const [account, setAccount] = useAccount();
  if (account === null) {
    return (
      <Button variant="ghost" asChild>
        <a
          href="#sign-in"
          onClick={(event) => {
            event.preventDefault();
            onSignIn();
          }}
        >
          Sign in
        </a>
      </Button>
    );
  }
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="ghost" iconStart={UserRound}>
          Account
        </Button>
      </Menu.Trigger>
      <Menu.Content aria-label="Account">
        <Menu.Group label={account}>
          <Menu.Item icon={Repeat} onSelect={onSubscription}>
            Your subscription
          </Menu.Item>
          <Menu.Item
            icon={LogOut}
            onSelect={() => {
              setAccount(null);
              toast("You're signed out.", { id: "account" });
            }}
          >
            Sign out
          </Menu.Item>
        </Menu.Group>
      </Menu.Content>
    </Menu>
  );
}
