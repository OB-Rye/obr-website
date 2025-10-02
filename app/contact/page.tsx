"use client";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string>("");

  // 🚀 Submit handler: sends all fields to /api/contact
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Honeypot spam trap
    if (String(fd.get("_hp") || "").trim() !== "") {
      setStatus("success");
      form.reset();
      return;
    }

    // Collect all fields into JSON
    const data: Record<string, any> = {};
    fd.forEach((value, key) => {
      if (data[key] !== undefined) {
        data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
      } else {
        data[key] = value;
      }
    });

    // Normalize common fields
    ["firstName","lastName","name","email","subject","phone","company","country","message"].forEach(k => {
      if (typeof data[k] === "string") data[k] = (data[k] as string).trim();
    });

    // Validate: require name, email, message
    const firstName = String(data.firstName ?? "");
    const lastName  = String(data.lastName ?? "");
    const fullName  = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : String(data.name ?? "");
    if (!fullName || !data.email || !data.message) {
      setError("Please provide your name, email, and message.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
      form.reset();
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">Contact</h1>
      <p className="text-gray-600 mb-8">
        Whether you&apos;re curious about my seminars, exploring coaching, or
        interested in consulting, I would love to hear from you. Please leave me a note below, and I&apos;ll get back to you as soon as I can.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Honeypot */}
        <input type="text" name="_hp" tabIndex={-1} autoComplete="off" className="hidden" />

        {/* First + Last name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="firstName">First Name *</label>
            <input id="firstName" name="firstName" required className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="lastName">Last Name *</label>
            <input id="lastName" name="lastName" required className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">Email Address *</label>
          <input id="email" name="email" type="email" required className="w-full border rounded px-3 py-2" />
        </div>

        {/* Company + Country */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="company">Company</label>
            <input id="company" name="company" className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="country">Country</label>
            <input id="country" name="country" className="w-full border rounded px-3 py-2" />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
          <input id="phone" name="phone" className="w-full border rounded px-3 py-2" placeholder="+1 (555) 123-4567" />
        </div>

        {/* Areas of Interest */}
        <div>
          <p className="text-sm font-medium mb-2">Areas of Interest</p>
          <p className="text-xs text-gray-500 mb-3">Select one or more areas you&apos;d like to explore:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 border rounded px-3 py-2">
              <input type="checkbox" name="interests" value="Seminars" /> <span>Seminars</span>
            </label>
            <label className="flex items-center gap-2 border rounded px-3 py-2">
              <input type="checkbox" name="interests" value="Coaching" /> <span>Coaching</span>
            </label>
            <label className="flex items-center gap-2 border rounded px-3 py-2">
              <input type="checkbox" name="interests" value="Team Workshops" /> <span>Team Workshops</span>
            </label>
            <label className="flex items-center gap-2 border rounded px-3 py-2">
              <input type="checkbox" name="interests" value="Strategic Consulting" /> <span>Strategic Consulting</span>
            </label>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="message">Your Message *</label>
          <textarea id="message" name="message" required rows={6} className="w-full border rounded px-3 py-2" placeholder="Tell me about your goals, challenges, or questions…"></textarea>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Send Message"}
        </button>

        {/* Status messages */}
        {status === "error" && <p className="text-red-600 text-sm">{error}</p>}
        {status === "success" && <p className="text-green-700 text-sm">✅ Message sent! Check your email for confirmation.</p>}
      </form>
    </div>
  );
}
