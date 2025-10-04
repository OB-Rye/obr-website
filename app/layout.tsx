import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../styles/globals.css";
import "../styles/obr-overrides.css";

export const metadata: Metadata = {
  // This makes relative URLs (like "/obr-social.jpg") resolve to your domain
  metadataBase: new URL("https://obrye.global"),

  title: {
    default: "Ole Bent Rye – Mastering Cultural Dynamics for Global Success",
    template: "%s · Ole Bent Rye",
  },
  description:
    "Seminars, coaching, and consulting to master cultural intelligence and win across borders.",

  openGraph: {
    type: "website",
    url: "https://obrye.global/",
    siteName: "Ole Bent Rye",
    title: "The Secret to Building the World’s Most Valuable Company",
    description: "Unlock the blind spot slowing your global success.",
    images: [
      {
        url: "/obr-social.jpg", // file in /public
        width: 1200,
        height: 630,
        alt: "Ole Bent Rye — The Secret to Building the World’s Most Valuable Company",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ole Bent Rye",
    description:
      "Seminars, coaching, and consulting to master cultural intelligence and win across borders.",
    images: ["/obr-social.jpg"],
  },

  alternates: { canonical: "https://obrye.global/" },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
