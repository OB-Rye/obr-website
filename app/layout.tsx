import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import { Geist, Geist_Mono } from "geist/font";   // 👈 added Geist fonts
import "../styles/globals.css";                   // 👈 use correct path
import "../styles/obr-overrides.css";             // 👈 new overrides file

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
        ${Geist.variable} 
        ${Geist_Mono.variable} 
        antialiased
      `}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
