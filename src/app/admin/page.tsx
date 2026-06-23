import { PollCreateForm } from "@/components/poll-create-form";

export default function AdminPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 px-4 py-12">
      <PollCreateForm />
    </div>
  );
}
