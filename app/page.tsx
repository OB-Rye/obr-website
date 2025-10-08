"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

export default function HomePage() {
  const [emailCopied, setEmailCopied] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const copyEmailToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("obrye@obrye.global")
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy email: ", err)
    }
  }

  // Official PDF link for both online view and download
  const pdfUrl = "https://obrye.global/files/Ole-Bent-Cultural-Framework-v2.pdf?v=1"

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
          {/* ✅ Brand links internally to home (works on obrye.global & previews) */}
          <Link
            href="/"
            className="text-xl font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 hover:opacity-90"
            aria-label="Go to obrye.global home"
          >
            OBR
          </Link>

          <Button
            variant="outline"
            onClick={copyEmailToClipboard}
            className="text-sm"
          >
            {emailCopied ? "Copied!" : "Copy Email"}
          </Button>
        </div>
      </nav>

      <main className="pt-24 flex flex-col items-center justify-center px-4">
        <Card className="w-full max-w-2xl shadow-lg border border-gray-200 rounded-2xl">
          <CardContent className="p-6 space-y-4 text-center">
            <h2 className="text-2xl font-bold">
              Ole Bent’s Cultural Framework
            </h2>
            <p className="text-gray-600">
              Explore Ole Bent Rye’s global framework for mastering cultural dynamics —
              developed from 40+ years across Silicon Valley, Asia, and Europe.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              {/* View Online */}
              <Button asChild variant="default">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  View Online
                </a>
              </Button>

              {/* Download PDF */}
              <Button asChild variant="outline">
                <a href={pdfUrl} download="Ole-Bent-Cultural-Framework-v2.pdf">
                  Download PDF
                </a>
              </Button>
            </div>

            <Badge className="mt-6" variant="secondary">
              Updated October 2025
            </Badge>
          </CardContent>
        </Card>
      </main>

      <footer className="mt-16 mb-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Ole Bent Rye |{" "}
        {/* ✅ Footer domain links internally to home */}
        <Link
          href="/"
          className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
          aria-label="Go to obrye.global home"
        >
          obrye.global
        </Link>
      </footer>
    </div>
  )
}
