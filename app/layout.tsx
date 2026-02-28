import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mdbin - Share Markdown",
  description:
    "A minimal, beautiful pastebin for Markdown. Share formatted text, code snippets, and documents with syntax highlighting.",
  openGraph: {
    title: "mdbin - Share Markdown",
    description:
      "A minimal, beautiful pastebin for Markdown. Share formatted text, code snippets, and documents with syntax highlighting.",
    type: "website",
    siteName: "mdbin",
  },
  twitter: {
    card: "summary",
    title: "mdbin - Share Markdown",
    description:
      "A minimal, beautiful pastebin for Markdown. Share formatted text, code snippets, and documents with syntax highlighting.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
