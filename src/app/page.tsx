import Image from "next/image";

import { PollVoting } from "@/components/poll-voting";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { aggregateVoteCounts, type CoursePoll } from "@/types/poll";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: poll, error: pollError } = await supabase
    .from("course_polls")
    .select("id, question, options, is_active, created_at")
    .eq("is_active", true)
    .maybeSingle();

  if (pollError) {
    throw new Error("Impossibile caricare il sondaggio attivo.");
  }

  if (!poll) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg text-center">
          <CardHeader className="items-center">
            <Image
              src="/logo.png"
              alt="LivePoll logo"
              width={64}
              height={64}
              className="dark:hidden"
              priority
            />
            <Image
              src="/logo-dark.png"
              alt="LivePoll logo"
              width={64}
              height={64}
              className="hidden dark:block"
              priority
            />
            <CardTitle>LivePoll</CardTitle>
            <CardDescription>Your vote. Live.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nessun sondaggio attivo al momento
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activePoll = poll as CoursePoll;

  const { data: votes, error: votesError } = await supabase
    .from("course_votes")
    .select("option_index")
    .eq("poll_id", activePoll.id);

  if (votesError) {
    throw new Error("Impossibile caricare i voti del sondaggio.");
  }

  const initialCounts = aggregateVoteCounts(
    votes ?? [],
    activePoll.options.length,
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-12">
      <PollVoting poll={activePoll} initialCounts={initialCounts} />
    </div>
  );
}
