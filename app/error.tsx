"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main" className="mx-auto max-w-xl px-5 py-24">
      <h1 className="text-h2">Something didn’t load.</h1>
      <p className="my-6 text-sm leading-6 text-charcoal">
        Your request couldn’t be completed. Please try again. If you’re setting
        up the starter, check your Supabase connection and apply the database
        migration.
      </p>
      <Button onClick={reset}>Try again</Button>
      <Link href="/" className="ml-5 text-sm underline">
        Go home
      </Link>
    </main>
  );
}
