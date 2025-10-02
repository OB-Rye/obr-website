"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const [messageLen, setMessageLen] = useState<number>(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot (simple spam trap): if filled, abort silently
    if (String(formData.get("company") || "").trim() !== "") {
      setStatus("success"); // pretend success to bots
      form.reset();
      setMessageLen(0);
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    // client-side guard (mirrors server validation)
    if (!payload.name || !payload.email || !payload.message) {
      setError("All fields (name, email, message) are required.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
      setMessageLen(0);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-3xl font-semibold">Contact</h1>
      <p className="mb-8 text-sm text-gray-600">
        Send a message and you’ll receive an automatic confirmation email. We’ll reply shortly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-md border px-3 py-2 outline-none ring-0 focus:border-gray-800"
            placeholder="Your name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border px-3 py-2 outline-none ring-0 focus:border-gray-800"
            placeholder="you@example.com"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message" // MUST match backend
            required
            rows={7}
            maxLength={5000}
            onChange={(e) => setMessageLen(e.currentTarget.value.length)}
            className="w-full resize-y rounded-md border px-3 py-2 outline-none ring-0 focus:border-gray-800"
            placeholder="Write your message here…"
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {messageLen.toLocaleString()}/5,000
          </div>
        </div>

        {/* Honeypot (hidden from humans) */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center rounded-md bg-black px-4 py-2 text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send"}
        </button>

        {/* Status messages */}
        {status === "success" && (
          <p className="text-sm text-green-700">
            Message sent! Check your inbox for a confirmation email.
          </p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-700">{error}</p>
        )}

        <p className="pt-2 text-xs text-gray-500">
          By submitting, you agree we may email you to respond to your inquiry.
        </p>
      </form>
    </main>
  );
}
