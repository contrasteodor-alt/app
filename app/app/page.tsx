import Link from "next/link";
import { PublicNavbar } from "@/components/public-navbar";

export default function HomePage() {
  return (
    <>
      <PublicNavbar />

      <section className="relative h-[100svh] w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Understand <span className="text-purple-400">WHY</span> You Lose OEE
            <br />& Have Scrap —
            <br />And What to Fix Next
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-200">
            AI that explains downtime, scrap and losses —
            so you know exactly what to improve.
          </p>

          <Link
            href="/login"
            className="mt-10 rounded-xl bg-purple-500 px-10 py-4 text-lg font-semibold hover:bg-purple-400 transition"
          >
            Get Started
          </Link>

          <p className="absolute bottom-6 text-sm text-slate-300">
            © {new Date().getFullYear()} CoMo Expert. All rights reserved.
          </p>
        </div>
      </section>
    </>
  );
}
