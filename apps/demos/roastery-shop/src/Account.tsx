import type { ReactElement } from "react";
import { Menu, useStoredState } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import { Button, Dialog, SignInForm, toast } from "@buttery/react";
import { LogOut, Repeat, UserRound } from "lucide-react";
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

/** Signing in, in a dialog: the email and password, checked before they're sent. */
export function SignInDialog({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  const [, setAccount] = useAccount();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content label="Sign in">
        <Dialog.Body>
          <SignInForm
            titleAs="h2"
            title="Sign in to Halfmoon"
            description="See your orders and change your subscription."
            onSubmit={async ({ email }) => {
              await new Promise((resolve) => {
                window.setTimeout(resolve, 400);
              });
              setAccount(email);
              onOpenChange(false);
              toast.success(`Signed in as ${email}.`, { id: "account" });
              return undefined;
            }}
          />
        </Dialog.Body>
      </Dialog.Content>
    </Dialog>
  );
}

/** The bar's account action: Sign in, or once signed in, a menu with the subscription and Sign out. */
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
      <Button variant="secondary" onClick={onSignIn}>
        Sign in
      </Button>
    );
  }
  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button variant="secondary" iconStart={UserRound}>
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
