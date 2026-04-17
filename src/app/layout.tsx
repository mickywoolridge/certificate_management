import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SSL certificate manager",
  description: "Track SSL certificate expiry and notify owners in the notice window",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">
          Schedule{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.8rem] dark:bg-zinc-900">POST /api/cron/notify</code> daily
          with <code className="rounded bg-zinc-100 px-1 py-0.5 text-[0.8rem] dark:bg-zinc-900">CRON_SECRET</code> to email
          owners when a certificate enters its notice period.
        </footer>
      </body>
    </html>
  );
}
