import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "MarketMind",
  description: "AI-Powered Stock & News Companion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
    <body className={`${inter.className} bg-white text-black dark:bg-zinc-900 dark:text-white`}>
      {children}
    </body>
  </html>
  );
}
