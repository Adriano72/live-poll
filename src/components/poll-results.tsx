"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { CourseVote } from "@/types/poll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type PollResultsProps = {
  pollId: string;
  options: string[];
  initialCounts: number[];
  userOptionIndex: number;
  onChangeVote: () => void;
  isChangingVote?: boolean;
};

export function PollResults({
  pollId,
  options,
  initialCounts,
  userOptionIndex,
  onChangeVote,
  isChangingVote = false,
}: PollResultsProps) {
  const [counts, setCounts] = useState(initialCounts);

  useEffect(() => {
    setCounts(initialCounts);
  }, [initialCounts]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`course_votes:${pollId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "course_votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          const vote = payload.new as CourseVote;
          setCounts((current) => {
            if (vote.option_index < 0 || vote.option_index >= current.length) {
              return current;
            }

            const next = [...current];
            next[vote.option_index] += 1;
            return next;
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "course_votes",
          filter: `poll_id=eq.${pollId}`,
        },
        (payload) => {
          const vote = payload.old as CourseVote;
          setCounts((current) => {
            if (vote.option_index < 0 || vote.option_index >= current.length) {
              return current;
            }

            const next = [...current];
            next[vote.option_index] = Math.max(0, next[vote.option_index] - 1);
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [pollId]);

  const totalVotes = counts.reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4">
        {options.map((option, index) => {
          const count = counts[index] ?? 0;
          const percentage =
            totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

          return (
            <div key={`${option}-${index}`} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{option}</span>
                  {index === userOptionIndex ? (
                    <Badge variant="secondary">Il tuo voto</Badge>
                  ) : null}
                </div>
                <span className="text-sm text-muted-foreground">
                  {count} {count === 1 ? "voto" : "voti"} · {percentage}%
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onChangeVote}
        disabled={isChangingVote}
      >
        {isChangingVote ? "Cancellazione in corso..." : "Cambia voto"}
      </Button>
    </div>
  );
}
