import type { ComponentMeta } from "@butteryui/core";

export const meta: ComponentMeta = {
  name: "SetupGuide",
  kind: "pattern",
  purpose:
    "A floating checklist in the bottom-end lane: progress, the next task, and every task when unfolded, remembered across visits.",
  useWhen: [
    "Getting a new account set up over several visits: add a coffee, set shipping, connect a bank",
    "A handful of tasks people can do in any session, with the next one a press away",
  ],
  avoidWhen: [
    "One suggestion: use Banner or RecommendationCard",
    "Steps that must happen in one sitting: use a Dialog with Onboarding",
  ],
  related: ["Banner", "RecommendationCard", "Toaster", "FloatingLanes"],
  a11y: "A region named by its title. The progress bar is named by the title too and reads as how many are done. The unfold button says whether it's open and points at the task list; each task is read as Done or To do before its title, and the next one's action is a button or a link. A group's header is a button that says whether the group is open and points at its tasks. The dismiss button is named Dismiss; as the guide goes, focus in it moves on to the next tab stop.",
  motion: "morph",
  keyboard: [
    {
      keys: "Enter or Space",
      does: "Presses the focused button: unfolds or folds the guide, opens or closes a group, runs the next task's action or dismisses the guide",
    },
    { keys: "Enter", does: "Follows the next task's link" },
    {
      keys: "Up and Down arrows",
      does: "Scroll the steps, with their list focused, once there are more than the guide shows",
    },
  ],
  layout:
    "It floats in the bottom-end lane, 288px wide but never wider than the lane, 8px from the lane's other items. Folded, it's as tall as its title, progress bar and next task; unfolded, its steps scroll inside it past 320px, each group's header is a 36px row that truncates and shows in full on hover, and its other buttons are 28px, with a 24px hit area on the next task's link.",
  reducedMotion:
    "It fades in and out over 100ms without rising, and its unfolding, its groups and their chevrons, and the progress bar's fill all land at once.",
};
