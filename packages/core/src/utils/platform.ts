/** Whether this runs on an Apple platform, where `mod` is ⌘ rather than Ctrl. */
export function isApplePlatform(): boolean {
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}
