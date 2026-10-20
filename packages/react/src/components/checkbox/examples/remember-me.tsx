import { useState } from "react";
import type { ReactElement } from "react";
import { Checkbox } from "@buttery/react";

/** A sign-in form's keep-me-signed-in box, controlled. */
export function RememberMe(): ReactElement {
  const [remember, setRemember] = useState(true);
  return (
    <Checkbox
      label="Keep me signed in"
      name="remember"
      checked={remember}
      onCheckedChange={(next) => {
        setRemember(next === true);
      }}
    />
  );
}
