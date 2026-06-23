"use server";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase-server";

type ActionResult = { error: string } | { voteId: string };

export async function vote(
  pollId: string,
  optionIndex: number,
  voterName: string,
): Promise<ActionResult> {
  const trimmedName = voterName.trim();

  if (!trimmedName) {
    return { error: "Inserisci il tuo nome per votare." };
  }

  if (optionIndex < 0) {
    return { error: "Opzione non valida." };
  }

  const supabase = await createServerSupabaseClient();

  const { data: poll, error: pollError } = await supabase
    .from("polls")
    .select("id, options, is_active")
    .eq("id", pollId)
    .eq("is_active", true)
    .maybeSingle();

  if (pollError) {
    return { error: "Errore nel recupero del sondaggio. Riprova." };
  }

  if (!poll) {
    return { error: "Sondaggio non trovato o non più attivo." };
  }

  if (optionIndex >= poll.options.length) {
    return { error: "Opzione non valida." };
  }

  const { data, error } = await supabase
    .from("votes")
    .insert({
      poll_id: pollId,
      option_index: optionIndex,
      voter_name: trimmedName,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Impossibile registrare il voto. Riprova." };
  }

  return { voteId: data.id };
}

export async function deleteVote(
  voteId: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("votes").delete().eq("id", voteId);

  if (error) {
    return { error: "Impossibile cancellare il voto. Riprova." };
  }

  return {};
}

export async function createPoll(
  question: string,
  options: string[],
): Promise<{ error?: string }> {
  const trimmedQuestion = question.trim();
  const trimmedOptions = options.map((option) => option.trim()).filter(Boolean);

  if (!trimmedQuestion) {
    return { error: "Inserisci una domanda per il sondaggio." };
  }

  if (trimmedOptions.length < 2) {
    return { error: "Servono almeno 2 opzioni." };
  }

  if (trimmedOptions.length > 4) {
    return { error: "Puoi inserire al massimo 4 opzioni." };
  }

  const supabase = await createServerSupabaseClient();

  const { error: deactivateError } = await supabase
    .from("polls")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    return { error: "Errore nell'aggiornamento dei sondaggi esistenti." };
  }

  const { error: insertError } = await supabase.from("polls").insert({
    question: trimmedQuestion,
    options: trimmedOptions,
    is_active: true,
  });

  if (insertError) {
    return { error: "Impossibile creare il sondaggio. Riprova." };
  }

  redirect("/");
}
