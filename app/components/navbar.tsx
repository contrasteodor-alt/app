import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg text-purple-700">
          CoMo Expert
        </Link>

        <nav className="flex items-center gap-4">
          <Link href= "https://comoexpertatyn.my.canva.site/" className="font-bold text-lg text-purple-700">
            Como_main_page
          </Link>
          <Link
            href="/b1e703aa-b2a7-4bc4-8f39-4cad931eaa25"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
          >
          

            Enter Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
