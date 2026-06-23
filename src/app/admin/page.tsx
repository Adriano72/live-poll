import { CreatePollForm } from "@/components/create-poll-form";

export default function AdminPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-8 min-h-[calc(100svh-5rem)] sm:px-6">
      <CreatePollForm />
    </main>
  );
}
