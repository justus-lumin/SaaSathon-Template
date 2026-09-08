import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isConfigured } from "@/lib/config";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { IdeaForm, DeleteIdea } from "@/components/idea-form";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your ideas" };
export default async function IdeasPage() {
  if (!isConfigured()) redirect("/login");
  const { supabase, userId, email } = await requireUser();
  const { data: ideas, error } = await supabase
    .from("ideas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error)
    throw new Error(
      "Could not load ideas. Check the connection and database migration.",
    );
  return (
    <>
      <header className="border-b border-black/10">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-5 lg:px-[30px]">
          <Link href="/" className="font-semibold">
            SaaSathon / Starter
          </Link>
          <div className="flex min-w-0 items-center gap-4">
            <span className="max-w-48 truncate text-sm text-charcoal">
              {email}
            </span>
            <form action={signOut}>
              <Button variant="ghost" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-5xl px-5 py-10 lg:px-[30px]">
        <div className="mb-10">
          <p className="text-body-2 mb-4">YOUR PRIVATE WORKSPACE</p>
          <h1 className="text-h2">Good ideas start here.</h1>
          <p className="mt-4 text-sm leading-6 text-charcoal">
            A place to capture the things you want to build. Only you can see
            these.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <section className="h-fit rounded-[20px] bg-off-white p-6">
            <h2 className="text-xl font-semibold mb-6">
              Make a little space for it.
            </h2>
            <IdeaForm />
          </section>
          <section aria-labelledby="ideas-heading">
            <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-4">
              <h2 id="ideas-heading" className="text-lg font-semibold">
                Your ideas
              </h2>
              <span className="rounded-full bg-off-white px-3 py-1 text-sm">
                {ideas.length}
              </span>
            </div>
            {ideas.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-black/20 px-6 py-14">
                <p className="text-h3">
                  A blank page.
                  <br />A good place to start.
                </p>
                <p className="mt-4 text-sm leading-6 text-charcoal">
                  Add your first idea using the form. It doesn’t have to be
                  perfect.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ideas.map((idea) => (
                  <article
                    key={idea.id}
                    className="rounded-[20px] border border-black/10 p-6"
                  >
                    <h3 className="break-words text-lg font-semibold">
                      {idea.title}
                    </h3>
                    {idea.description && (
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-charcoal">
                        {idea.description}
                      </p>
                    )}
                    <details className="mt-4">
                      <summary className="w-fit cursor-pointer text-sm font-medium underline underline-offset-4">
                        Edit idea
                      </summary>
                      <div className="mt-5">
                        <IdeaForm idea={idea} />
                        <DeleteIdea idea={idea} />
                      </div>
                    </details>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
