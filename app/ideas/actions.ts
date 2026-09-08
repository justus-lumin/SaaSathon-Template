"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { ideaSchema, idSchema, type FormState } from "@/lib/validation";

export async function saveIdea(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, userId } = await requireUser();
  const parsed = ideaSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const id = form.get("id");
  if (id !== null && !idSchema.safeParse(id).success)
    return { error: "This idea could not be found." };
  // RLS remains the final authority, even for direct API calls outside this app.
  const query =
    typeof id === "string"
      ? supabase
          .from("ideas")
          .update(parsed.data)
          .eq("id", id)
          .eq("user_id", userId)
      : supabase.from("ideas").insert({ ...parsed.data, user_id: userId });
  const { data, error } = await query.select("id").single();
  if (error || !data) return { error: "Couldn’t save your idea. Try again." };
  revalidatePath("/ideas");
  return { success: typeof id === "string" ? "Changes saved." : "Idea added." };
}

export async function deleteIdea(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const { supabase, userId } = await requireUser();
  const id = idSchema.safeParse(form.get("id"));
  if (!id.success) return { error: "This idea could not be found." };
  const { data, error } = await supabase
    .from("ideas")
    .delete()
    .eq("id", id.data)
    .eq("user_id", userId)
    .select("id")
    .single();
  if (error || !data) return { error: "Couldn’t delete your idea. Try again." };
  revalidatePath("/ideas");
  return { success: "Idea deleted." };
}
