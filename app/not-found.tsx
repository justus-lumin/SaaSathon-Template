import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="grid-container py-24">
      <p className="text-body-2">404</p>
      <h1 className="text-h2 my-6">Nothing here yet.</h1>
      <Link href="/" className="underline">
        Back to the start
      </Link>
    </main>
  );
}
