"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { deleteVote, vote } from "@/app/actions";
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
import {
  type CoursePoll,
  livepollVoteKey,
  type StoredVote,
} from "@/types/poll";

type PollVotingProps = {
  poll: CoursePoll;
  initialCounts: number[];
};

function PollCardHeader({ question }: { question: string }) {
  return (
    <CardHeader className="items-center text-center">
      <Image
        src="/logo.png"
        alt="LivePoll logo"
        width={128}
        height={128}
        className="dark:hidden"
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="LivePoll logo"
        width={128}
        height={128}
        className="hidden dark:block"
        priority
      />
      <CardTitle>{question}</CardTitle>
      <CardDescription>Your vote. Live.</CardDescription>
    </CardHeader>
  );
}

export function PollVoting({ poll, initialCounts }: PollVotingProps) {
  const [storedVote, setStoredVote] = useState<StoredVote | null>(null);
  const [counts, setCounts] = useState(initialCounts);
  const [voterName, setVoterName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingVote, setIsChangingVote] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    const raw = localStorage.getItem(livepollVoteKey(poll.id));

    if (!raw) {
      setIsHydrated(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as StoredVote;

      if (
        parsed.voted &&
        typeof parsed.voteId === "string" &&
        typeof parsed.voterName === "string" &&
        typeof parsed.optionIndex === "number"
      ) {
        setStoredVote(parsed);
        setVoterName(parsed.voterName);
      }
    } catch {
      localStorage.removeItem(livepollVoteKey(poll.id));
    }

    setIsHydrated(true);
  }, [poll.id]);

  async function handleVote(optionIndex: number) {
    setError(null);
    setIsSubmitting(true);

    const result = await vote(poll.id, optionIndex, voterName);

    if ("error" in result) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    const nextVote: StoredVote = {
      voted: true,
      voteId: result.voteId,
      voterName: voterName.trim(),
      optionIndex,
    };

    localStorage.setItem(livepollVoteKey(poll.id), JSON.stringify(nextVote));
    setCounts((current) => {
      const next = [...current];
      next[optionIndex] += 1;
      return next;
    });
    setStoredVote(nextVote);
    setIsSubmitting(false);
  }

  async function handleChangeVote() {
    if (!storedVote) {
      return;
    }

    setError(null);
    setIsChangingVote(true);

    const result = await deleteVote(storedVote.voteId);

    if (result && "error" in result) {
      setError(result.error);
      setIsChangingVote(false);
      return;
    }

    localStorage.removeItem(livepollVoteKey(poll.id));
    setCounts((current) => {
      const next = [...current];
      next[storedVote.optionIndex] = Math.max(
        0,
        next[storedVote.optionIndex] - 1,
      );
      return next;
    });
    setStoredVote(null);
    setIsChangingVote(false);
  }

  if (!isHydrated) {
    return (
      <Card className="w-full">
        <PollCardHeader question={poll.question} />
        <CardContent>
          <p className="text-sm text-muted-foreground">Caricamento...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <PollCardHeader question={poll.question} />
      <CardContent className="flex flex-col gap-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {storedVote ? (
          <PollResults
            pollId={poll.id}
            options={poll.options}
            initialCounts={counts}
            userOptionIndex={storedVote.optionIndex}
            onChangeVote={handleChangeVote}
            isChangingVote={isChangingVote}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="voter-name">Il tuo nome</Label>
              <Input
                id="voter-name"
                value={voterName}
                onChange={(event) => setVoterName(event.target.value)}
                placeholder="Inserisci il tuo nome"
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              {poll.options.map((option, index) => (
                <Button
                  key={`${option}-${index}`}
                  type="button"
                  variant="outline"
                  className="h-auto justify-start px-4 py-3 text-left"
                  disabled={isSubmitting || !voterName.trim()}
                  onClick={() => handleVote(index)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
