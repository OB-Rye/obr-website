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
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErrorMsg(null);

    const fd = new FormData(e.currentTarget);

    // quick front-end validation for required fields
    if (!fd.get("firstName") || !fd.get("lastName") || !fd.get("email")) {
      setLoading(false);
      setOk(false);
      setErrorMsg("First name, last name and email are required.");
      return;
    }

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
          _hp: fd.get("_hp"), // honeypot (anti-spam hidden field)
        }),
      });

      const result = await res.json().catch(() => ({}));

      if (res.ok && result.success) {
        setOk(true);
        (e.currentTarget as HTMLFormElement).reset();
      } else {
        throw new Error(result.message || "Failed to send email");
      }
    } catch (err) {
      console.error("Form submit failed:", err);
      setOk(false);
      setErrorMsg("Something went wrong while sending your message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* v0 field markup passed in as children */}
      {children}

      {/* Submit button */}
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
          A confirmation email has also been sent to your inbox.
        </p>
      )}
      {ok === false && (
        <p className="mt-3 text-sm text-red-600">
          ❌ {errorMsg || "Something went wrong. Please try again later."}
        </p>
      )}
    </form>
  );
}
