"use client";

import * as React from "react";

type Props = {
  className?: string;
  /** Paste the original v0 form fields (everything INSIDE <form>…</form>) as children */
  children?: React.ReactNode;
};

export default function V0ContactClient({ className = "", children }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | boolean>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);

    const fd = new FormData(e.currentTarget);

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
          _hp: fd.get("_hp"), // honeypot (hidden anti-spam field, keep in markup)
        }),
      });

      setOk(res.ok);
      if (res.ok) (e.currentTarget as HTMLFormElement).reset();
    } catch (err) {
      console.error("Form submit failed:", err);
      setOk(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* Keep ALL original v0 field markup as children so the design stays 1:1 */}
      {children}

      {/* Unified v0-style submit (gradient applied via obr-overrides.css) */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Sending…" : "Send Message"}
        </button>
      </div>

      {/* Inline status */}
      {ok === true && (
        <p className="mt-3 text-sm text-green-600">
          ✅ Your message has been sent successfully!
        </p>
      )}
      {ok === false && (
        <p className="mt-3 text-sm text-red-600">
          ❌ Something went wrong. Please try again later.
        </p>
      )}
    </form>
  );
}
