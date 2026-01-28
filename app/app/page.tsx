import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="rounded-2xl border bg-card p-10 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              CoMo Lean AI
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Factory operations insights, continuous improvement, and AI-driven decision support.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Organization login */}
            <div className="rounded-xl border p-6 hover:shadow transition">
              <h2 className="text-xl font-semibold mb-2">
                Organization Access
              </h2>
              <p className="mb-6 text-muted-foreground">
                Sign in to your organization workspace to manage operations,
                KPIs, and improvement actions.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Login
              </Link>
            </div>

            {/* Demo access */}
            <div className="rounded-xl border p-6 hover:shadow transition">
              <h2 className="text-xl font-semibold mb-2">
                Live Demo
              </h2>
              <p className="mb-6 text-muted-foreground">
                Explore the platform with a fully functional demo factory.
                No account required.
              </p>
              <Link
                href="/b1e703aa-b2a7-4bc4-8f39-4cad931eaa25"
                className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2 font-medium hover:bg-muted"
              >
                Enter Demo
              </Link>
            </div>
          </div>

          <div className="mt-10 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} CoMo Lean AI. All rights reserved.
          </div>
        </div>
      </div>
    </main>
  );
}
