import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        CoMo Lean AI
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        An operational intelligence platform for factories that want
        to control OEE, scrap, and continuous improvement — with
        engineering-grade logic and AI-supported action plans.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {/* LOGIN / SIGN UP */}
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Login / Sign up
        </Link>

        {/* DEMO */}
        <Link
          href="/login?mode=demo"
          className="inline-flex h-11 items-center justify-center rounded-md border px-6 text-sm font-medium"
        >
          Explore Demo Factory
        </Link>
      </div>

      <div className="mt-16 max-w-3xl text-sm text-muted-foreground">
        Built for Plant Managers, COOs, and investors who need a
        transparent link between production results, operational
        events, and measurable improvement actions.
      </div>
    </main>
  );
}
