import Link from "next/link";
import Image from "next/image";

export function PublicNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 text-white">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/Como_logo_Teh2.png"
            alt="CoMo Expert"
            width={26}
            height={26}
            priority
          />
          <span className="font-semibold">CoMo Expert</span>
        </Link>

        {/* Actions */}
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link
            href="/b1e703aa-b2a7-4bc4-8f39-4cad931eaa25"
            className="rounded-lg border border-white/40 px-4 py-2 hover:bg-white/10"
          >
            Live Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
