import { useId } from "react";
import type { ReactElement } from "react";
import { Icon, Morph, Stack, Surface, Text } from "@buttery/core";
import { ArrowLink, Section, buttery } from "@buttery/react";
import { ChevronDown } from "lucide-react";
import { QUESTIONS } from "./data.ts";
import type { Question } from "./data.ts";

function QuestionItem({
  question,
  open,
  onOpenChange,
}: {
  readonly question: Question;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}): ReactElement {
  const answer = useId();
  return (
    <div className="shop-question">
      <h3 className="shop-question-heading">
        <buttery.button
          focus
          className="shop-question-button"
          aria-expanded={open}
          aria-controls={answer}
          onClick={() => {
            onOpenChange(!open);
          }}
        >
          <Text variant="title-sm">{question.question}</Text>
          <Icon icon={ChevronDown} className="shop-chevron" />
        </buttery.button>
      </h3>
      <Morph id={answer} disclosure contentKey={open ? "open" : "closed"}>
        {open ? (
          <div className="shop-answer">
            <Text variant="body" tone="secondary">
              {question.answer}
            </Text>
          </div>
        ) : null}
      </Morph>
    </div>
  );
}

/** The questions customers ask, each opening in place, beside a way to ask another. */
export function Questions({
  open,
  onOpenChange,
}: {
  /** The questions that are open, by id. */
  readonly open: readonly string[];
  readonly onOpenChange: (open: readonly string[]) => void;
}): ReactElement {
  return (
    <Section
      id="questions"
      tone="muted"
      title="Questions, answered"
      body="What people ask us most, from shipping to storing a bag."
    >
      <div className="shop-faq">
        <Surface level="card" className="shop-question-list">
          {QUESTIONS.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              open={open.includes(question.id)}
              onOpenChange={(next) => {
                onOpenChange(
                  next
                    ? [...open, question.id]
                    : open.filter((id) => id !== question.id),
                );
              }}
            />
          ))}
        </Surface>
        <Surface level="card" pad={6}>
          <Stack gap={4} align="start">
            <Stack gap={3}>
              <Text variant="title" asChild>
                <h3>Still wondering about something?</h3>
              </Text>
              <Text variant="body-sm" tone="secondary">
                Write to us and Rosa or Theo will answer within a day, Monday to
                Friday.
              </Text>
            </Stack>
            <ArrowLink href="mailto:hello@halfmoon.example" arrow="external">
              hello@halfmoon.example
            </ArrowLink>
          </Stack>
        </Surface>
      </div>
    </Section>
  );
}
