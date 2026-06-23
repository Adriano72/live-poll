"use client";

import { useCallback, useEffect, useState } from "react";

import { deleteVote, vote } from "@/app/actions";
import { BrandLogo } from "@/components/brand-logo";
import { PollResults } from "@/components/poll-results";
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
import type { Poll, StoredVote } from "@/types/poll";

type PollVotingProps = {
  poll: Poll;
  initialCounts: number[];
};

function getStorageKey(pollId: string) {
  return `livepoll_vote_${pollId}`;
}

function readStoredVote(pollId: string): StoredVote | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(getStorageKey(pollId));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredVote;

    if (
      parsed.voted &&
      parsed.voteId &&
      parsed.voterName &&
      typeof parsed.optionIndex === "number"
    ) {
      return parsed;
    }
  } catch {
    localStorage.removeItem(getStorageKey(pollId));
  }

  return null;
}

export function PollVoting({ poll, initialCounts }: PollVotingProps) {
  const [storedVote, setStoredVote] = useState<StoredVote | null>(null);
  const [voterName, setVoterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingVote, setIsChangingVote] = useState(false);

  useEffect(() => {
    const saved = readStoredVote(poll.id);

    if (saved) {
      setStoredVote(saved);
      setVoterName(saved.voterName);
    }
  }, [poll.id]);

  const handleVote = useCallback(
    async (optionIndex: number) => {
      setError(null);
      setIsSubmitting(true);

      const result = await vote(poll.id, optionIndex, voterName);

      if ("error" in result) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      const saved: StoredVote = {
        voted: true,
        voteId: result.voteId,
        voterName: voterName.trim(),
        optionIndex,
      };

      localStorage.setItem(getStorageKey(poll.id), JSON.stringify(saved));
      setStoredVote(saved);
      setIsSubmitting(false);
    },
    [poll.id, voterName],
  );

  const handleChangeVote = useCallback(async () => {
    if (!storedVote) {
      return;
    }

    setError(null);
    setIsChangingVote(true);

    const result = await deleteVote(storedVote.voteId);

    if (result.error) {
      setError(result.error);
      setIsChangingVote(false);
      return;
    }

    localStorage.removeItem(getStorageKey(poll.id));
    setStoredVote(null);
    setIsChangingVote(false);
  }, [poll.id, storedVote]);

  if (storedVote) {
    return (
      <PollResults
        poll={poll}
        initialCounts={initialCounts}
        userOptionIndex={storedVote.optionIndex}
        onChangeVote={handleChangeVote}
        isChangingVote={isChangingVote}
        error={error}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl [--card-spacing:--spacing(6)]">
      <CardHeader className="items-center gap-6 text-center">
        <BrandLogo
          size="card"
          showWordmark={false}
          className="justify-center"
        />
        <div className="flex w-full flex-col gap-2">
          <CardTitle className="text-2xl sm:text-3xl">{poll.question}</CardTitle>
          <CardDescription className="text-base">Your vote. Live.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label htmlFor="voter-name">Il tuo nome</Label>
          <Input
            id="voter-name"
            value={voterName}
            onChange={(event) => setVoterName(event.target.value)}
            placeholder="Inserisci il tuo nome"
            className="h-10"
            required
          />
        </div>

        <div className="flex flex-col gap-3">
          {poll.options.map((option, index) => (
            <Button
              key={`${option}-${index}`}
              type="button"
              variant="outline"
              className="h-auto w-full py-4"
              disabled={isSubmitting || !voterName.trim()}
              onClick={() => handleVote(index)}
            >
              {option}
            </Button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
