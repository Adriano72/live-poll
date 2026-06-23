"use client";

import { useState, useTransition } from "react";

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

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 4;

export function PollCreateForm() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateOption(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    );
  }

  function addOption() {
    setOptions((current) =>
      current.length < MAX_OPTIONS ? [...current, ""] : current,
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createPoll(question, options);

      if (result && "error" in result) {
        setError(result.error);
      }
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Crea sondaggio</CardTitle>
        <CardDescription>
          Il nuovo sondaggio diventa subito attivo e disattiva quelli precedenti.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="poll-question">Domanda</Label>
            <Input
              id="poll-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Qual è la tua domanda?"
              required
            />
          </div>

          <div className="flex flex-col gap-4">
            <Label>Opzioni</Label>
            {options.map((option, index) => (
              <div key={`option-${index}`} className="flex flex-col gap-2">
                <Label htmlFor={`poll-option-${index}`} className="sr-only">
                  Opzione {index + 1}
                </Label>
                <Input
                  id={`poll-option-${index}`}
                  value={option}
                  onChange={(event) => updateOption(index, event.target.value)}
                  placeholder={`Opzione ${index + 1}`}
                  required={index < MIN_OPTIONS}
                />
              </div>
            ))}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={options.length >= MAX_OPTIONS || isPending}
            >
              Aggiungi opzione
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creazione in corso..." : "Crea Poll"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
