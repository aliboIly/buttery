import { useState } from "react";
import type { ReactElement } from "react";
import { PasswordField } from "@buttery/react";

/** A new password with its rules ticked off as you type. */
export function NewPassword(): ReactElement {
  const [password, setPassword] = useState("");
  return (
    <PasswordField
      label="Choose a password"
      autoComplete="new-password"
      value={password}
      onValueChange={setPassword}
      requirements={[
        { label: "At least 8 characters", met: password.length >= 8 },
        { label: "A number", met: /\d/.test(password) },
      ]}
    />
  );
}
