"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";

export function OrgNavbar() {
  const { orgId } = useParams<{ orgId: string }>();
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: `/${orgId}` },
    { label: "OEE", href: `/${orgId}/oee` },
    { label: "Scrap", href: `/${orgId}/scrap` },
    { label: "Insert Data", href: `/${orgId}/ingest` },
    { label: "Actions", href: `/${orgId}/actions` },
  ];

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* LEFT: Logo */}
        <Link href="/" className="flex items-center gap-2">

          <Image
            src="/assets/Como_logo_Teh2.png"
            alt="CoMo Expert"
            width={28}
            height={28}
            priority
          />
          <span className="font-semibold tracking-tight">
            CoMo Expert
          </span>
        </Link>

        {/* CENTER: Navigation */}
        <nav className="flex gap-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT: Org name */}
        <div className="text-sm text-muted-foreground">
          Organization
        </div>
      </div>
    </header>
  );
}
