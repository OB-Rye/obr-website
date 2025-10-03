import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import { GeistSans } from "geist/font/sans";   // ✅ correct import
import { GeistMono } from "geist/font/mono";   // ✅ correct import
import "../styles/globals.css";
import "../styles/obr-overrides.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

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
        ${inter.variable} 
        ${manrope.variable} 
        ${GeistSans.variable} 
        ${GeistMono.variable} 
        antialiased
      `}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}

