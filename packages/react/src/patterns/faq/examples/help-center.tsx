import { useState } from "react";
import type { ReactElement } from "react";
import { Inline, Stack, Text } from "@butteryui/core";
import type { ExampleKind, ExamplePlay } from "@butteryui/core";
import { Button, Faq } from "@butteryui/react";
import type { FaqGroup, FaqQuestion } from "@butteryui/react";

const GROUPS: readonly FaqGroup[] = [
  { value: "start", label: "Getting started" },
  { value: "slides", label: "Slides" },
  { value: "present", label: "Presenting" },
  { value: "account", label: "Your account" },
];

const QUESTIONS: readonly FaqQuestion[] = [
  {
    id: "help-new-deck",
    group: "start",
    question: "How do I start a new deck?",
    answer:
      "Press New deck on the home screen and pick a theme. You can change the theme later without losing anything.",
  },
  {
    id: "help-import",
    group: "start",
    question: "Can I bring in slides I already have?",
    answer:
      "Drop a PDF onto the home screen and each page becomes a slide you can write over.",
  },
  {
    id: "help-reorder",
    group: "slides",
    question: "How do I reorder slides?",
    answer:
      "Drag a slide in the strip, or select it and press Alt with the up and down arrows.",
  },
  {
    id: "help-notes",
    group: "slides",
    question: "Where do speaker notes go?",
    answer:
      "Under the slide, in the notes field. Only you see them while you present.",
  },
  {
    id: "help-present",
    group: "present",
    question: "How do I present to a room?",
    answer:
      "Press Present, then move the presenter window to the screen in front of you. The room sees the slides; you see your notes.",
  },
  {
    id: "help-offline",
    group: "present",
    question: "Does presenting work offline?",
    answer:
      "Yes. A deck you've opened once is kept on your computer, fonts and pictures included.",
  },
  {
    id: "help-export",
    group: "account",
    question: "How do I export a deck?",
    answer:
      "Open the deck's menu and choose Export, then PDF for handouts or PNG for each slide on its own.",
  },
  {
    id: "help-delete",
    group: "account",
    question: "Can I get back a deck I deleted?",
    answer:
      "For 30 days. Open Recently deleted from the home screen and press Restore.",
  },
];

const POPULAR = ["help-present", "help-export", "help-reorder"] as const;

/** A help center whose page keeps the open questions, so its popular links open one in whichever topic it's in. */
export function HelpCenter(): ReactElement {
  const [open, setOpen] = useState<readonly string[]>([]);
  return (
    <Stack gap={8}>
      <Inline gap={2} align="center" wrap>
        <Text variant="label" tone="secondary">
          Popular
        </Text>
        {POPULAR.map((id) => (
          <Button
            key={id}
            variant="soft"
            size="sm"
            onClick={() => {
              setOpen(open.includes(id) ? open : [...open, id]);
            }}
          >
            {QUESTIONS.find((question) => question.id === id)?.question}
          </Button>
        ))}
      </Inline>
      <Faq
        title="Help with Deckhand"
        intro="Answers about making, presenting and sharing decks."
        layout="two-column"
        variant="cards"
        search
        groups={GROUPS}
        questions={QUESTIONS}
        value={open}
        onValueChange={setOpen}
        contact={
          <Faq.Contact
            description="Write to help@deckhand.example and we'll answer within a working day."
            actions={
              <Button variant="soft" asChild>
                <a href="mailto:help@deckhand.example">Write to us</a>
              </Button>
            }
          />
        }
      />
    </Stack>
  );
}

export const kind: ExampleKind = "controlled";

export const play: ExamplePlay = async ({ press, see }) => {
  await press("button", "How do I present to a room?");
  await see(/^Press Present, then move the presenter window/);
  await press("button", "How do I export a deck?");
  await see(/^Open the deck's menu and choose Export/);
};
