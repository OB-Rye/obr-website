"use client";

import * as React from "react";

export default function OBRContactForm() {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | boolean>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);

    const form = e.currentTarget;
    const fd = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fd.get("firstName"),
          lastName: fd.get("lastName"),
          email: fd.get("email"),
          phone: fd.get("phone"),
          company: fd.get("company"),
          country: fd.get("country"),
          subject: fd.get("subject"),
          message: fd.get("message"),
          interests: fd.getAll("interests"),
          _hp: fd.get("_hp"), // honeypot
        }),
      });

      setOk(res.ok);
      if (res.ok) form.reset();
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* First / Last */}
      <div>
        <label className="label" htmlFor="firstName">First name</label>
        <input className="input mt-2" id="firstName" name="firstName" placeholder="Ada" />
      </div>
      <div>
        <label className="label" htmlFor="lastName">Last name</label>
        <input className="input mt-2" id="lastName" name="lastName" placeholder="Lovelace" />
      </div>

      {/* Email / Phone */}
      <div>
        <label className="label" htmlFor="email">Email *</label>
        <input className="input mt-2" id="email" name="email" type="email" required placeholder="you@company.com" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input className="input mt-2" id="phone" name="phone" placeholder="+47 999 99 999" />
      </div>

      {/* Company / Country */}
      <div>
        <label className="label" htmlFor="company">Company</label>
        <input className="input mt-2" id="company" name="company" placeholder="Company AS" />
      </div>
      <div>
        <label className="label" htmlFor="country">Country</label>
        <input className="input mt-2" id="country" name="country" placeholder="Norway" />
      </div>

      {/* Subject */}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="subject">Subject</label>
        <input className="input mt-2" id="subject" name="subject" placeholder="Seminar, coaching, consulting…" />
      </div>

      {/* Message */}
      <div className="sm:col-span-2">
        <label className="label" htmlFor="message">Message *</label>
        <textarea className="input mt-2" id="message" name="message" required placeholder="Write your message…" />
      </div>

      {/* Interests */}
      <div className="sm:col-span-2">
        <span className="label">I’m interested in</span>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["Seminar", "Coaching", "Consulting"].map((x) => (
            <label key={x} className="checkcard">
              <input type="checkbox" name="interests" value={x} className="rounded" />
              <span>{x}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="sm:col-span-2">
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Sending…" : "Send message"}
        </button>
        {ok === true && <p className="mt-3 text-sm text-green-600">Sent!</p>}
        {ok === false && <p className="mt-3 text-sm text-red-600">Something went wrong.</p>}
      </div>
    </form>
  );
}
