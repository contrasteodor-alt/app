"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function PublicNavbar({
  isHomePage = false,
  isLoginPage = false,
}: {
  isHomePage?: boolean;
  isLoginPage?: boolean;
}) {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

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
          {/* Login (only when NOT logged in and NOT on login page) */}
          {!isLoggedIn && !isLoginPage && (
            <Link
              href="/login?mode=login"
              className="text-slate-700 hover:text-slate-900 hover:underline"
            >
              Login
            </Link>
          )}

          {/* Logout (always visible when logged in) */}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-slate-700 hover:text-slate-900 hover:underline"
            >
              Logout
            </button>
          )}

          {/* Live Demo (ONLY on home, only when NOT logged in) */}
          {isHomePage && !isLoggedIn && (
            <Link
              href="/login?mode=demo"
              className="rounded-lg border border-white/40 px-4 py-2 text-slate-200 hover:bg-white/10 hover:text-white"
            >
              Live Demo
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
