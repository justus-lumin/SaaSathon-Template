# SaaSathon Starter

**Start small. Build something that matters.**

A working foundation for SaaSathon teams: Next.js, TypeScript, Supabase and Tailwind. Sign in by email, create an idea, edit it, then delete it. Every account owns its data, enforced by Postgres row-level security.

[Use this template](https://github.com/justus-lumin/SaaSathon-Template/generate) · [SaaSathon](https://www.saasathon.dev) · [Database migration](supabase/migrations/20260908000000_ideas.sql)

## What you get

- Next.js App Router and React Server Components for reads; Server Actions for writes.
- Email code sign-in, verified session cookies and protected routes.
- A complete private ideas workspace with validation, loading, empty, error and pending states.
- Accessible labels, keyboard focus, semantic forms and confirmation before deletion.
- Typed Supabase clients, one migration, explicit grants and four ownership policies.
- SaaSathon's blue/black/off-white palette, Inter typography and shared Button convention.
- A lockfile, CI, a local integration test and Vercel configuration.

There are no billing systems, event credentials or mandatory AI services. This example uses individual ownership; extend the schema deliberately if you need shared team records.

## 1. Make a repository

Choose **Use this template → Create a new repository** on GitHub, then clone **your new repository**.

You need Node.js 22+, pnpm 10 and Docker for local Supabase. The Supabase CLI is pinned as a development dependency, so every command below uses `pnpm`.

```sh
cd your-repository
pnpm install
cp .env.example .env.local
```

Real environment files are ignored by Git. Never paste service-role keys, private keys or database passwords into frontend variables. The app only needs a **publishable key** (the legacy local `anon` key also works).

## 2. Start the local database

With Docker running:

```sh
pnpm db:start
pnpm supabase status
```

Copy the displayed API URL and **publishable key** into `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55431
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-local-publishable-key
```

The first start downloads images and applies the migration automatically. Local ports are intentionally separate from Supabase's defaults:

| Service     | Address                |
| ----------- | ---------------------- |
| API         | http://127.0.0.1:55431 |
| Postgres    | localhost:55432        |
| Studio      | http://127.0.0.1:55433 |
| Email inbox | http://127.0.0.1:55434 |

The local email templates already include your sign-in code. No email provider or paid project is needed for local development.

To recreate **only this local database** from the migration:

```sh
pnpm db:reset
```

This removes local users and ideas. It explicitly uses `--local`; never run a reset against a linked production project. When you finish local development, `pnpm supabase stop` stops this starter's stack and preserves its data. If these ports or the project ID are already in use, change `supabase/config.toml` before starting another copy; don't stop someone else's stack.

## 3. Run the app

```sh
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Choose **Open your workspace**, enter an email and use the code in the [local inbox](http://127.0.0.1:55434). Your first sign-in creates an account. Create an idea, open **Edit idea**, save changes and delete it.

If another app uses port 3000, use `pnpm dev --port 3100`. Never replace an existing dev server. Restart your own app after changing public environment variables.

Without environment configuration, the app shows setup guidance instead of a broken sign-in flow.

## 4. Deploy your version

Use a Supabase project dedicated to **your app**, never the SaaSathon event database. Creating hosted projects can have costs; use your team's approved account and plan.

1. In your Supabase project, open **Connect** and copy the project URL and publishable key.
2. Apply the migration to your empty app database. Either run its SQL in Supabase's SQL editor, **or** use the CLI:

   ```sh
   pnpm supabase login
   pnpm supabase link --project-ref YOUR_PROJECT_REF
   pnpm supabase db push
   ```

   Check the target project before confirming. `db push` applies pending migrations; it does not reset the database.

3. In **Authentication → Email Templates**, set **both Confirm signup and Magic Link** to the content of [`supabase/templates/magic-link.html`](supabase/templates/magic-link.html). Keep `{{ .Token }}` in the email: the app expects a code, not a clickable link. Keep email signup enabled. Set code expiry to 10 minutes if desired.
4. Configure your approved SMTP provider for public use. Supabase's default email service is restricted and is suitable for initial testing only; see [the SMTP guide](https://supabase.com/docs/guides/auth/auth-smtp). Keep delivery rate limits enabled; consider Supabase CAPTCHA before opening sign-in to an untrusted audience.
5. In Vercel, **Add New → Project**, import your repository and choose Next.js. Keep the repository root as the root directory. Select Node.js 22 or newer. `vercel.json` supplies install/build commands.
6. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to Production. Use a separate test project for Preview when appropriate. Public variables are embedded at build time; redeploy after changing them.
7. Deploy. Set Supabase's **Authentication → URL Configuration → Site URL** to your deployed HTTPS URL. This starter uses typed email codes and does not need wildcard redirect URLs or an OAuth callback.
8. Verify on the deployed URL: request a code, sign in, create/edit/delete an idea, sign out, then use a second account and confirm it cannot see the first account's ideas.

Vercel supplies HTTPS and deployments from Git. No custom server, cron or extra hosting service is required. A successful build is not proof that hosted email delivery and database permissions work: complete step 8 for your own project.

## Verify changes

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
# With this starter's local Supabase stack running:
pnpm test:integration
```

The integration test refuses remote Supabase URLs. It creates and cleans up two temporary local users, checks real database CRUD, anonymous denial, cross-account isolation, immutable ownership and database validation. It also builds a production app on a temporary free port and exercises real HTTP form submissions: email code sign-in, cookies, protected pages, create/read/update/delete and sign-out. It never uses an existing dev server or sends real external emails. The local SMTP inbox captures test messages.

CI runs the same checks on a fresh Linux runner. Browser interaction and visual QA remain a separate check; the HTTP test does not simulate a browser.

## Find your way around

```text
app/
  page.tsx                 Landing page
  login/                   Email-code actions and sign-in page
  ideas/                   Protected read, CRUD actions, loading state
  error.tsx                Recoverable error boundary
components/
  ui/                      Shared Button and field styling
  idea-form.tsx            Small interactive forms
lib/
  auth.ts                  Verified identity for protected actions
  config.ts                Validated public configuration
  validation.ts            Input schemas shared by actions and tests
  database.types.ts        Generated database types
  supabase/                Browser and server cookie clients
proxy.ts                   Session refresh; private/no-store response
supabase/
  config.toml              Isolated local development configuration
  migrations/              Reproducible schema and access policies
  templates/               Local and hosted email-code template
scripts/test-integration.ts Local-only database and HTTP verification
```

## Extend it

Keep the next feature just as small: a table, one migration, a protected read and a validated mutation.

1. Create a migration with `pnpm supabase migration new your_feature`.
2. Add constraints, explicit grants and RLS alongside the table. Derive owner IDs from verified authentication, never submitted form values. Use membership policies for shared data.
3. Apply locally with `pnpm db:reset` (destructive to local data), then regenerate types with `pnpm db:types`.
4. Keep database reads in Server Components and writes in Server Actions. Mark server-only modules with `server-only`; do not import them into Client Components. The browser client is available for a feature that needs subscriptions or uploads.
5. Validate inputs before calling the database, return useful errors and test access using two accounts. The publishable key is public: RLS must protect direct API access too.
6. Reuse `components/ui` and `app/globals.css` tokens. Use black text on the brand blue; keep readable contrast, keyboard focus and mobile layouts.

The generated Supabase types mirror database columns; database grants still prevent changing `user_id` or `created_at` after insertion. No service-role client exists in app code; the integration test uses a local admin client only to create and remove test users.

## Documentation and licences

Implementation references: [Supabase SSR clients](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security), [email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [local CLI](https://supabase.com/docs/guides/local-development/cli/getting-started), [Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).

Code: [MIT](LICENSE). Inter: SIL Open Font License, distributed by Fontsource. See [third-party notices](THIRD_PARTY_NOTICES.md). The commercial ABC Camera typeface and Lumin artwork are intentionally not distributed with this template.
