"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

type VoteResult = { voteId: string } | { error: string };
type ActionResult = { error: string } | void;

export async function vote(
  pollId: string,
  optionIndex: number,
  voterName: string,
): Promise<VoteResult> {
  const trimmedName = voterName.trim();

  if (!trimmedName) {
    return { error: "Inserisci il tuo nome per votare." };
  }

  if (!Number.isInteger(optionIndex) || optionIndex < 0) {
    return { error: "Opzione non valida." };
  }

  const supabase = await createClient();

  const { data: poll, error: pollError } = await supabase
    .from("course_polls")
    .select("id, options, is_active")
    .eq("id", pollId)
    .eq("is_active", true)
    .maybeSingle();

  if (pollError) {
    return { error: "Impossibile verificare il sondaggio. Riprova." };
  }

  if (!poll) {
    return { error: "Sondaggio non trovato o non attivo." };
  }

  if (optionIndex >= poll.options.length) {
    return { error: "Opzione non valida." };
  }

  const { data, error } = await supabase
    .from("course_votes")
    .insert({
      poll_id: pollId,
      option_index: optionIndex,
      voter_name: trimmedName,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Impossibile registrare il voto. Riprova." };
  }

  return { voteId: data.id };
}

export async function deleteVote(voteId: string): Promise<ActionResult> {
  if (!voteId) {
    return { error: "Voto non valido." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("course_votes")
    .delete()
    .eq("id", voteId);

  if (error) {
    return { error: "Impossibile cancellare il voto. Riprova." };
  }
}

export async function createPoll(
  question: string,
  options: string[],
): Promise<ActionResult> {
  const trimmedQuestion = question.trim();
  const trimmedOptions = options
    .map((option) => option.trim())
    .filter(Boolean);

  if (!trimmedQuestion) {
    return { error: "Inserisci una domanda." };
  }

  if (trimmedOptions.length < 2) {
    return { error: "Servono almeno 2 opzioni." };
  }

  if (trimmedOptions.length > 4) {
    return { error: "Puoi aggiungere al massimo 4 opzioni." };
  }

  const supabase = await createClient();

  const { error: deactivateError } = await supabase
    .from("course_polls")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    return { error: "Impossibile disattivare i sondaggi precedenti." };
  }

  const { error: insertError } = await supabase.from("course_polls").insert({
    question: trimmedQuestion,
    options: trimmedOptions,
    is_active: true,
  });

  if (insertError) {
    return { error: "Impossibile creare il sondaggio. Riprova." };
  }

  redirect("/");
}
