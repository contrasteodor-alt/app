"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // ❌ Nu afișăm navbar pe pagina de login
  if (pathname.startsWith("/login")) return null;

  async function onLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();

    // redirect determinist
    router.push("/login");
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-tight">
          CoMo Lean AI
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-3">
         <Link
          href="/ingest"
           className="text-sm font-medium text-muted-foreground hover:text-foreground"
         >
          Ingest
           </Link>

           <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
           >
            Logout
           </Button>
</div>

      </div>
    </header>
  );
}
