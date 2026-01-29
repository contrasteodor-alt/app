import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg text-purple-700">
          CoMo Expert
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm hover:underline">
            Login
          </Link>
          <Link
            href="/login?demo=true"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
            Live Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
