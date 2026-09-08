# SaaSathon Starter

Keep this a small, readable foundation. Prefer one complete feature over layers of abstractions.

- Use pnpm, TypeScript strict mode, Next.js App Router and Tailwind v4.
- Keep reads in Server Components; use Server Actions for mutations and small Client Components for interactive forms.
- Validate every action input. Derive ownership from verified authentication, never a submitted user ID.
- Every new public table needs a migration, grants, RLS and a two-account access test.
- Match the tokens in app/globals.css and reuse components/ui. Inter is the only bundled font; do not add unlicensed brand assets.
- Never commit .env.local, database credentials, tokens or private keys. Use public placeholders in .env.example.
- Use only a dedicated local/test database for tests. Never reset a linked/production database.
- Run pnpm lint, pnpm typecheck, pnpm test, pnpm build and, when Docker is available, pnpm test:integration.
- Do not provision paid services or additional production projects without the owner's approval.
