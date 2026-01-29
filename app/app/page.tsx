import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">

      {/* HERO */}
      
<section className="relative h-[100svh] w-full overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900" />
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">

        {/* Logo */}
        <Image
          src="/assets/Como_logo_Teh2.png"
          alt="CoMo Expert"
          width={140}
          height={140}
          priority
          className="mb-6"
        />

        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Understand <span className="text-purple-300">WHY</span> You Lose OEE
          <br />& Have Scrap —
          <br />And What to Fix Next
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-200">
          AI that explains downtime and scrap —
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
  );




      {/* KPI SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <OEECard />
        <ScrapCard />
      </section>

      {/* AI FLOW */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="AI Detects Root Cause"
          text="Downtime, scrap and losses are automatically linked to real operational causes."
        />
        <InfoCard
          title="AI Suggests Actions"
          text="Maintenance, process or organizational actions are proposed based on data."
        />
        <InfoCard
          title="You Decide & Improve"
          text="Managers stay in control. AI supports decisions — it doesn’t replace them."
        />
      </section>

      {/* FOOTER */}
      <footer className="mt-20 border-t pt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} CoMo Expert. All rights reserved.
      </footer>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function OEECard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-semibold mb-4">OEE Breakdown</h3>

      <div className="mb-4">
        <span className="text-3xl font-bold text-purple-600">58%</span>
        <p className="text-sm text-muted-foreground">Overall OEE</p>
      </div>

      <div className="space-y-3">
        <Bar label="Equipment Failure" value={26} />
        <Bar label="Changeovers" value={15} />
        <Bar label="Material Shortage" value={10} />
      </div>
    </div>
  );
}

function ScrapCard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Scrap Analysis</h3>

      <div className="mb-4">
        <span className="text-3xl font-bold text-red-500">12%</span>
        <p className="text-sm text-muted-foreground">Scrap Rate</p>
      </div>

      <ul className="space-y-2 text-sm">
        <li>🔴 Defective Parts</li>
        <li>🟡 Operator Error</li>
        <li>🟢 Bad Material</li>
      </ul>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-purple-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function InfoCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
