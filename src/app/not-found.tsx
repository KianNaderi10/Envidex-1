import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🔍</span>
      <div>
        <h1 className="text-xl font-bold mb-1">Page not found</h1>
        <p className="text-sm text-muted-foreground">That page doesn&apos;t exist or has moved.</p>
      </div>
      <Link
        href="/"
        className="rounded-2xl bg-primary text-primary-foreground px-6 py-3 text-sm font-semibold"
      >
        Go home
      </Link>
    </div>
  );
}
