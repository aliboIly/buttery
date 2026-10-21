import type { ComponentMeta } from "@buttery/core";

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
  a11y: "A region named by its title. The progress bar is named by the title too and reads as how many are done. The unfold button says whether it's open and points at the task list; each task is read as Done or To do before its title, and the next one's action is a button or a link. The dismiss button is named Dismiss; as the guide goes, focus in it moves on to the next tab stop.",
  motion: "morph",
};
