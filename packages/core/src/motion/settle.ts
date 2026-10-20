let running = 0;

function publish(): void {
  if (typeof document === "undefined") return;
  document.documentElement.toggleAttribute("data-bt-settled", running === 0);
}

/**
 * Registers a running buttery animation and returns the function that ends it (safe to call twice).
 * While any animation runs, `<html>` drops `data-bt-settled`, which layout checks wait for.
 * Ambient loops don't register.
 */
export function trackAnimation(): () => void {
  running += 1;
  publish();
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    running -= 1;
    publish();
  };
}

/** Whether no buttery animation is running. */
export function isSettled(): boolean {
  return running === 0;
}

/** Writes the current settled state onto `<html>`. `ButteryProvider` calls it when it mounts. */
export function publishSettled(): void {
  publish();
}
