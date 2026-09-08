export default function Loading() {
  return (
    <main id="main" className="mx-auto max-w-5xl px-5 py-16" aria-busy="true">
      <p role="status" className="text-lg">
        Loading your ideas…
      </p>
      <div className="mt-8 h-64 rounded-[20px] bg-off-white motion-safe:animate-pulse" />
    </main>
  );
}
