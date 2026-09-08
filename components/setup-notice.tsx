export function SetupNotice() {
  return (
    <aside className="rounded-[20px] border border-black/15 bg-off-white p-6">
      <h2 className="font-semibold">Connect your Supabase project</h2>
      <p className="mt-2 text-sm leading-6 text-charcoal">
        Copy <code>.env.example</code> to <code>.env.local</code>, add your
        project URL and publishable key, then restart your app. Follow the
        README to apply the database migration and email templates.
      </p>
    </aside>
  );
}
