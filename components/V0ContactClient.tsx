"use client";

import * as React from "react";

/**
 * Props extend native form attributes so we can forward onSubmit and friends.
 */
type Props = React.FormHTMLAttributes<HTMLFormElement> & {
  className?: string;
  /** v0 form fields go in as children (everything inside <form>…</form>) */
  children?: React.ReactNode;
};

export default function V0ContactClient({
  className = "",
  children,
  onSubmit,            // <- parent can provide a handler
  ...rest
}: Props) {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | boolean>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Built-in submit handler (used only if parent doesn't pass onSubmit)
  const handleInternalSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setOk(null);
      setErrorMsg(null);

      const form = e.currentTarget;
      const fd = new FormData(form);
      const get = (k: string) => (fd.get(k) ?? "").toString().trim();
      const getAll = (k: string) => fd.getAll(k).map(v => v.toString().trim()).filter(Boolean);

      // Gather fields (names match your current markup)
      const firstName = get("firstName");
      const lastName  = get("lastName");
      const name      = get("name") || `${firstName} ${lastName}`.trim();
      const email     = get("email");
      const phone     = get("phone");
      const company   = get("company");
      const country   = get("country");
      const subject   = get("subject");
      const message   = get("message");
      const _hp       = get("_hp"); // honeypot

      // interests: support checkbox group and single value
      const interestsArr = getAll("interests");
      const interests: string[] | string =
        interestsArr.length ? interestsArr : (get("interests") || "");

      // Validation aligned with API: require email + message
      if (!email) {
        setLoading(false);
        setOk(false);
        setErrorMsg("Email is required.");
        return;
      }
      if (!message) {
        setLoading(false);
        setOk(false);
        setErrorMsg("Message is required.");
        return;
      }

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            firstName: firstName || undefined,
            lastName:  lastName  || undefined,
            name:      name      || undefined,
            email,
            phone:     phone     || undefined,
            company:   company   || undefined,
            country:   country   || undefined,
            subject:   subject   || undefined,
            message,
            interests,
            _hp,
          }),
        });

        const result = await res.json().catch(() => ({}));
        if (res.ok && result?.success) {
          setOk(true);
          form.reset();
        } else {
          throw new Error(result?.message || "Failed to send message");
        }
      } catch (err) {
        console.error("Form submit failed:", err);
        setOk(false);
        setErrorMsg("Something went wrong while sending your message.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return (
    <form
      // Use parent-provided handler if present; otherwise use internal one
      onSubmit={onSubmit ?? handleInternalSubmit}
      className={className}
      {...rest}
    >
      {/* v0 field markup passed in as children */}
      {children}

      {/* Submit button (unchanged style) */}
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
          ✅ Your message has been sent successfully! A confirmation email has been sent to your inbox.
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
