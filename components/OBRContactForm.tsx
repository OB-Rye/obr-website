"use client";
import * as React from "react";

export default function OBRContactForm() {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | boolean>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        name: formData.get("name"), // fallback if needed
        email: formData.get("email"),
        company: formData.get("company"),
        country: formData.get("country"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        interests: formData.getAll("interests"),
        _hp: formData.get("_hp"), // honeypot
      }),
    });

    setOk(res.ok);
    setLoading(false);
    if (res.ok) (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* Honeypot */}
      <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

      <div>
        <label className="label" htmlFor="firstName">First name</label>
        <input className="input mt-2" id="firstName" name="firstName" placeholder="Ada" />
      </div>

      <div>
        <label className="label" htmlFor="lastName">Last name</label>
        <input className="input mt-2" id="lastName" name="lastName" placeholder="Lovelace" />
      </div>

      <div>
        <label className="label" htmlFor="email">Email *</label>
        <input className="input mt-2" id="email" name="email" type="email" required placeholder="you@company.com" />
      </div>

      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input className="input mt-2" id="phone" name="phone" placeholder="+47 999 99 999" />
      </div>

      <div>
        <label className="label" htmlFor="company">Company</label>
        <input className="input mt-2" id="company" name="company" placeholder="Company AS" />
      </div>

      <div>
        <label className="label" htmlFor="country">Country</label>
        <input className="input mt-2" id="country" name="country" placeholder="Norway" />
      </div>

      <div className="sm:col-span-2">
        <label className="label" htmlFor="subject">Subject</label>
        <input className="input mt-2" id="subject" name="subject" placeholder="Seminar, coaching, consulting…" />
      </div>

      <div className="sm:col-span-2">
        <label className="label" htmlFor="message">Message *</label>
        <textarea className="input mt-2" id="message" name="message" required placeholder="Write your message…" />
      </div>

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

      <div className="sm:col-span-2 flex items-center gap-4">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Sending…" : "Send message"}
        </button>
        {ok === true && <span className="text-sm text-green-600">Sent!</span>}
        {ok === false && <span className="text-sm text-red-600">Something went wrong.</span>}
      </div>
    </form>
  );
}
