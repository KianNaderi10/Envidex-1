"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = useMemo(
    () => searchParams.get("callbackUrl") ?? "/",
    [searchParams]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  const submitCredentials = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setBusy(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setBusy(false);

    if (!result || result.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? callbackUrl);
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/80 p-6 shadow-2xl backdrop-blur-sm">
        <div className="mb-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Envidex</p>
          <h1 className="mt-3 text-2xl font-bold">Log in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use email/password or continue with OAuth.
          </p>
        </div>

        <form onSubmit={submitCredentials} className="space-y-3">
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full rounded-xl border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />

          {error ? <p className="text-sm text-red-400">{error}</p> : null}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {busy ? "Signing in..." : "Log in"}
          </button>
        </form>

        <div className="my-4 h-px w-full bg-border" />

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl })}
            className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm font-medium"
          >
            Continue with GitHub
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="text-primary underline underline-offset-4">
            Create one
          </Link>
        </p>
      </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
