import type { ReactElement } from "react";
import { PasswordField } from "@buttery/react";

/** The password on a sign-in form, filled in by the browser's saved password. */
export function SignInPassword(): ReactElement {
  return <PasswordField label="Password" name="password" size="lg" />;
}
