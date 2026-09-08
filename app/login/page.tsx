import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { SetupNotice } from "@/components/setup-notice";
import { isConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };
export default async function LoginPage() {
  const configured = isConfigured();
  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    if (data?.claims.sub) redirect("/ideas");
  }
  return (
    <main
      id="main"
      className="grid-container flex min-h-screen flex-col bg-blue py-6"
    >
      <Link href="/" className="w-fit font-semibold">
        SaaSathon / Starter
      </Link>
      <div className="mx-auto my-auto w-full max-w-md py-16">
        <p className="text-body-2 mb-4">YOUR NEXT IDEA</p>
        <h1 className="text-h2 mb-4">Let’s get started.</h1>
        <p className="mb-8 text-sm leading-6">
          We’ll email you a code. Your first sign-in creates your account.
        </p>
        {configured ? <LoginForm /> : <SetupNotice />}
      </div>
      <p className="text-sm">A little less setup. A lot more building.</p>
    </main>
  );
}
