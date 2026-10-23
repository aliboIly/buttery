import { useStoredState } from "@butteryui/core";
import type { StoredStateSetter } from "@butteryui/core";
import { STORAGE_PREFIX } from "./storage.ts";

function isSession(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** Who's signed in to the demo, by the email or phone they signed in with, or `null`, kept across visits. */
export function useSession(): readonly [
  string | null,
  StoredStateSetter<string | null>,
] {
  return useStoredState<string | null>(
    `${STORAGE_PREFIX}:session`,
    null,
    isSession,
  );
}
