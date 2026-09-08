"use client";
import { useActionState } from "react";
import { saveIdea, deleteIdea } from "@/app/ideas/actions";
import { Button } from "@/components/ui/button";
import { fieldClass } from "@/components/ui/field";
import type { Tables } from "@/lib/database.types";
type Idea = Tables<"ideas">;

export function IdeaForm({ idea }: { idea?: Idea }) {
  const [state, action, pending] = useActionState(saveIdea, {});
  const key = idea?.id ?? "new";
  return (
    <form action={action} className="space-y-4">
      {idea && <input type="hidden" name="id" value={idea.id} />}
      <div>
        <label htmlFor={`${key}-title`} className="text-sm font-medium">
          Title
        </label>
        <div className="mt-2">
          <input
            id={`${key}-title`}
            name="title"
            required
            maxLength={120}
            defaultValue={idea?.title}
            placeholder="What if we built…"
            className={fieldClass}
            disabled={pending}
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${key}-description`} className="text-sm font-medium">
          Description{" "}
          <span className="font-normal text-charcoal">(optional)</span>
        </label>
        <textarea
          id={`${key}-description`}
          name="description"
          maxLength={2000}
          rows={4}
          defaultValue={idea?.description}
          placeholder="Who is it for? What does it help them do?"
          className={`${fieldClass} mt-2 resize-y`}
          disabled={pending}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : idea ? "Save changes" : "Add idea"}
      </Button>
      <p
        aria-live="polite"
        role={state.error ? "alert" : "status"}
        className="text-sm leading-6"
      >
        {state.error || state.success}
      </p>
    </form>
  );
}
export function DeleteIdea({ idea }: { idea: Idea }) {
  const [state, action, pending] = useActionState(deleteIdea, {});
  return (
    <form
      action={action}
      className="mt-4 border-t border-black/10 pt-4"
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${idea.title}”? This cannot be undone.`))
          event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={idea.id} />
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "Deleting…" : "Delete idea"}
      </Button>
      <p role="alert" className="mt-2 text-sm">
        {state.error}
      </p>
    </form>
  );
}
