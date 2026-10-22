import { useStoredState } from "@buttery/core";
import type { StoredStateSetter } from "@buttery/core";
import { STORAGE_PREFIX } from "./storage.ts";

function isFlag(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNames(value: unknown): value is readonly string[] {
  return (
    Array.isArray(value) && value.every((name) => typeof name === "string")
  );
}

/** Whether the shop offers local pickup, kept across visits. */
export function usePickup(): readonly [boolean, StoredStateSetter<boolean>] {
  return useStoredState(`${STORAGE_PREFIX}:pickup`, false, isFlag);
}

/** The people invited to the shop's team, kept across visits. */
export function useInvites(): readonly [
  readonly string[],
  StoredStateSetter<readonly string[]>,
] {
  return useStoredState<readonly string[]>(
    `${STORAGE_PREFIX}:invites`,
    [],
    isNames,
  );
}
