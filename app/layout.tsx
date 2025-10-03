import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";   // ✅ Geist Sans
import { GeistMono } from "geist/font/mono";   // ✅ Geist Mono
import "../styles/globals.css";
import "../styles/obr-overrides.css";

export const metadata: Metadata = {
  title: "O'Brye Global - Cultural Intelligence & Global Business Consulting",
  description:
    "Unlock your global success with cultural intelligence expertise. Former Cisco executive helping leaders master international business dynamics.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${GeistSans.variable} 
        ${GeistMono.variable} 
        antialiased
      `}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
