"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { codeSchema, emailSchema, type FormState } from "@/lib/validation";

export async function requestCode(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const email = emailSchema.safeParse(form.get("email"));
  if (!email.success) return { error: "Enter a valid email address." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({ email: email.data });
  if (error)
    return { error: "We couldn’t send a code. Wait a minute and try again." };
  return {
    success: "Check your email for your sign-in code.",
    email: email.data,
  };
}

export async function verifyCode(
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const email = emailSchema.safeParse(form.get("email"));
  const code = codeSchema.safeParse(form.get("code"));
  if (!email.success || !code.success)
    return { error: "Enter your email and the code from your inbox." };
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: code.data,
    type: "email",
  });
  if (error)
    return {
      error:
        "That code is invalid or expired. Request a new code and try again.",
    };
  revalidatePath("/", "layout");
  redirect("/ideas");
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not sign out. Please try again.");
  revalidatePath("/", "layout");
  redirect("/login");
}
