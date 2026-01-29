import "./globals.css";
import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Navbar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
