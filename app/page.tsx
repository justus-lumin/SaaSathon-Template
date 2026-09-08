import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isConfigured } from "@/lib/config";
import { SetupNotice } from "@/components/setup-notice";
const primitives = [
  [
    "01",
    "A way in.",
    "Email sign-in. A private workspace. A session that follows you from page to page.",
  ],
  [
    "02",
    "A place for ideas.",
    "Create, edit and delete your ideas. Your account owns your data, all the way down to the database.",
  ],
  [
    "03",
    "Room to build.",
    "A small, typed codebase. Clear boundaries. Make it yours and ship something people want.",
  ],
];
export default function Home() {
  return (
    <>
      <header className="grid-container flex items-center justify-between gap-4 py-6">
        <Link href="/" className="font-semibold tracking-tight">
          SaaSathon / Starter
        </Link>
        <a
          href="https://github.com/justus-lumin/SaaSathon-Template"
          className="inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
        >
          View source <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </header>
      <main id="main">
        <section className="grid-container bg-blue py-16 lg:py-24">
          <div className="grid-12 gap-y-10">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-body-2 mb-8">NEXT.JS · SUPABASE · VERCEL</p>
              <h1 className="text-h1 max-w-4xl">
                Start small.
                <br />
                Build something
                <br />
                that matters.
              </h1>
            </div>
            <div className="col-span-12 flex flex-col items-start justify-end gap-7 lg:col-span-4">
              <p className="text-body-1 max-w-sm">
                Your next idea starts here. Sign in, make it tangible, then make
                it yours.
              </p>
              <Button asChild size="xl">
                <Link href="/ideas">
                  Open your workspace <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <p className="text-sm">One example. The essentials, connected.</p>
            </div>
          </div>
        </section>
        <section
          className="grid-container py-12 lg:py-20"
          aria-label="What is included"
        >
          <div className="grid-12 gap-y-5">
            {primitives.map(([number, title, body]) => (
              <article
                key={number}
                className="col-span-12 flex min-h-64 flex-col rounded-[20px] bg-off-white p-6 lg:col-span-4 lg:p-8"
              >
                <span className="text-sm text-charcoal">{number}</span>
                <h2 className="text-h3 mt-10">{title}</h2>
                <p className="mt-4 max-w-sm text-sm leading-6 text-charcoal">
                  {body}
                </p>
              </article>
            ))}
          </div>
          {!isConfigured() && (
            <div className="mt-6">
              <SetupNotice />
            </div>
          )}
        </section>
      </main>
      <footer className="grid-container flex flex-wrap justify-between gap-4 border-t border-black/10 py-6 text-sm">
        <span>Built for a good starting point.</span>
        <a
          href="https://www.saasathon.dev"
          className="underline underline-offset-4"
        >
          Made for SaaSathon
        </a>
      </footer>
    </>
  );
}
