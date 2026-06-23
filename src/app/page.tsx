import { BrandLogo } from "@/components/brand-logo";
import { PollVoting } from "@/components/poll-voting";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Poll } from "@/types/poll";

const pageMainClassName =
  "mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-8 min-h-[calc(100svh-5rem)] sm:px-6";

const cardClassName = "w-full max-w-2xl [--card-spacing:--spacing(6)]";

function buildCounts(optionsLength: number, votes: { option_index: number }[]) {
  const counts = Array.from({ length: optionsLength }, () => 0);

  for (const vote of votes) {
    if (vote.option_index >= 0 && vote.option_index < optionsLength) {
      counts[vote.option_index] += 1;
    }
  }

  return counts;
}

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (pollError) {
    return (
      <main className={pageMainClassName}>
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="text-2xl">Errore</CardTitle>
            <CardDescription className="text-base">
              Impossibile caricare il sondaggio. Riprova più tardi.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!poll) {
    return (
      <main className={pageMainClassName}>
        <Card className={`${cardClassName} text-center`}>
          <CardHeader className="items-center gap-6">
            <BrandLogo
              size="hero"
              className="flex-col items-center text-center"
              wordmarkClassName="text-center"
            />
          </CardHeader>
          <CardContent>
            <p className="text-base text-muted-foreground">
              Nessun sondaggio attivo al momento
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const activePoll = poll as Poll;

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("option_index")
    .eq("poll_id", activePoll.id);

  if (votesError) {
    return (
      <main className={pageMainClassName}>
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="text-2xl">Errore</CardTitle>
            <CardDescription className="text-base">
              Impossibile caricare i voti. Riprova più tardi.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const initialCounts = buildCounts(activePoll.options.length, votes ?? []);

  return (
    <main className={pageMainClassName}>
      <PollVoting poll={activePoll} initialCounts={initialCounts} />
    </main>
  );
}
