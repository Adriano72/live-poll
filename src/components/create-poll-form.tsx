"use client";

import { useState } from "react";

import { createPoll } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const MAX_OPTIONS = 4;

export function CreatePollForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddOption = () => {
    if (options.length >= MAX_OPTIONS) {
      return;
    }

    setOptions((previous) => [...previous, ""]);
  };

  const handleOptionChange = (index: number, value: string) => {
    setOptions((previous) =>
      previous.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createPoll(question, options);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl [--card-spacing:--spacing(6)]">
      <CardHeader className="gap-2">
        <CardTitle className="text-2xl">Crea sondaggio</CardTitle>
        <CardDescription className="text-base">
          Il nuovo sondaggio diventerà attivo e sostituirà quello corrente.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Label htmlFor="question">Domanda</Label>
            <Input
              id="question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Qual è la domanda del sondaggio?"
              className="h-10"
              required
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <Label>Opzioni</Label>
            {options.map((option, index) => (
              <Input
                key={`option-${index}`}
                value={option}
                onChange={(event) =>
                  handleOptionChange(index, event.target.value)
                }
                placeholder={`Opzione ${index + 1}`}
                className="h-10"
                required
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full py-4 h-auto"
              onClick={handleAddOption}
              disabled={options.length >= MAX_OPTIONS}
            >
              Aggiungi opzione
            </Button>
          </div>

          <Separator />

          <Button
            type="submit"
            className="w-full py-4 h-auto"
            disabled={isSubmitting}
          >
            Crea Poll
          </Button>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
