import type { timing } from "@butteryui/core";

/** What each timing token times, in a few words, for Motion › Tokens. Every token needs one. */
export const TIMING_TEXT: Readonly<Record<keyof typeof timing, string>> = {
  stagger: "The gap between staggered items, closer in a long list",
  "entrance-max": "The longest choreographed entrance, stagger included",
  "delay-hover-open": "The pointer's rest on a trigger before its menu opens",
  "delay-hover-close": "The wait after the pointer leaves before a menu closes",
  "delay-hover-skip": "The time after a close in which a menu reopens at once",
  "delay-submenu": "The pointer's rest on an item before its submenu opens",
  "delay-tooltip": "The wait before a tooltip opens",
  "delay-follow": "The wait before chrome that follows a change arrives",
  "delay-loading": "How long loading lasts before a loading pill shows",
  "delay-search": "The pause after typing before a search asks a server",
  typeahead: "How long typed letters build up one search in a list",
  "count-up": "A stat counting up to its number",
  "loop-cycle": "One step of a `Loop`",
  celebration: "A confetti burst's life",
  "toast-life": "How long a toast stays while nothing pauses it",
  "toast-life-action": "How long a toast with an action stays",
  "announcement-life": "How long a live region holds what it announced",
};
