import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Backoffice",
  description: "Customer operations backoffice",
};

const SECTIONS = [
  { href: "/", label: "Customers" },
  { href: "/payouts", label: "Payouts" },
] as const;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <nav aria-label="Sections" className="border-b">
          <div className="mx-auto flex w-full max-w-6xl gap-4 px-6 py-3 text-sm">
            {SECTIONS.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="text-muted-foreground hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
