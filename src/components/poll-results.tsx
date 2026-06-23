"use client";

import { useEffect, useMemo, useState } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createClient } from "@/lib/supabase";
import type { Poll, Vote } from "@/types/poll";

type PollResultsProps = {
  poll: Poll;
  initialCounts: number[];
  userOptionIndex: number;
  onChangeVote: () => void;
  isChangingVote: boolean;
  error: string | null;
};

export function PollResults({
  poll,
  initialCounts,
  userOptionIndex,
  onChangeVote,
  isChangingVote,
  error,
}: PollResultsProps) {
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    async function loadCounts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("votes")
        .select("option_index")
        .eq("poll_id", poll.id);

      if (error || !data) {
        return;
      }

      const next = poll.options.map(() => 0);

      for (const vote of data) {
        next[vote.option_index] = (next[vote.option_index] ?? 0) + 1;
      }

      setCounts(next);
    }

    void loadCounts();
  }, [poll.id, poll.options]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`votes-${poll.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          const newVote = payload.new as Vote;

          setCounts((previous) => {
            const next = [...previous];

            while (next.length < poll.options.length) {
              next.push(0);
            }

            next[newVote.option_index] = (next[newVote.option_index] ?? 0) + 1;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "votes",
          filter: `poll_id=eq.${poll.id}`,
        },
        (payload) => {
          const oldVote = payload.old as Vote;

          if (typeof oldVote.option_index !== "number") {
            return;
          }

          setCounts((previous) => {
            const next = [...previous];

            while (next.length < poll.options.length) {
              next.push(0);
            }

            next[oldVote.option_index] = Math.max(
              0,
              (next[oldVote.option_index] ?? 0) - 1,
            );
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [poll.id, poll.options.length]);

  const totalVotes = useMemo(
    () => counts.reduce((sum, count) => sum + count, 0),
    [counts],
  );

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
        {poll.options.map((option, index) => {
          const count = counts[index] ?? 0;
          const percentage =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isUserVote = index === userOptionIndex;

          return (
            <div key={`${option}-${index}`} className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{option}</span>
                  {isUserVote ? <Badge>Il tuo voto</Badge> : null}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {count} · {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-4" />
            </div>
          );
        })}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full py-4"
          onClick={onChangeVote}
          disabled={isChangingVote}
        >
          Cambia voto
        </Button>
      </CardFooter>
    </Card>
  );
}
