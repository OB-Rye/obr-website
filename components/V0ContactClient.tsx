"use client";

import * as React from "react";

type Props = {
  className?: string;
  /** v0 form fields go in as children (everything inside <form>…</form>) */
  children?: React.ReactNode;
};

export default function V0ContactClient({ className = "", children }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [ok, setOk] = React.useState<null | boolean>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Helper to format a human-friendly list: "A", "A and B", "A, B and C"
  const formatList = (arr: string[]) => {
    if (arr.length <= 1) return arr.join("");
    if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
    return `${arr.slice(0, -1).join(", ")} and ${arr[arr.length - 1]}`;
  };

  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setOk(null);
    setErrorMsg(null);

    const form = e.currentTarget;

    // Use built-in HTML5 validation for required fields in the markup
    if (!form.checkValidity()) {
      const missing: string[] = [];
      const fn = form.querySelector<HTMLInputElement>("#firstName");
      const ln = form.querySelector<HTMLInputElement>("#lastName");
      const em = form.querySelector<HTMLInputElement>("#email");
      if (!fn?.value.trim()) missing.push("First Name");
      if (!ln?.value.trim()) missing.push("Last Name");
      if (!em?.value.trim()) missing.push("Email Address");

      setLoading(false);
      setOk(false);
      setErrorMsg(
        missing.length
          ? `Please fill in: ${formatList(missing)}.`
          : "Please complete the required fields."
      );

      // Focus the first missing field
      for (const el of [fn, ln, em]) {
        if (!el?.value.trim()) {
          el?.focus();
          break;
        }
      }

      form.reportValidity();
      return;
    }

    const fd = new FormData(form);
    const get = (k: string) => (fd.get(k) ?? "").toString().trim();
    const getAll = (k: string) => fd.getAll(k).map(v => v.toString().trim()).filter(Boolean);

    const firstName = get("firstName");
    const lastName  = get("lastName");
    const name      = get("name") || `${firstName} ${lastName}`.trim();
    const email     = get("email");
    const phone     = get("phone");
    const company   = get("company");
    const country   = get("country");
    const message   = get("message") || undefined; // OPTIONAL
    const _hp       = get("_hp");

    const interestsArr = getAll("interests");
    const interests: string[] | string =
      interestsArr.length ? interestsArr : (get("interests") || "");

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
          // subject omitted (admin subject is static server-side)
          message, // optional
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
  }, []);

  return (
    <form onSubmit={handleSubmit} className={className} data-v0c-rev="v0c-2025-10-04-SSR">
      {/* v0 field markup passed in as children */}
      {children}

      {/* Submit button with stronger hover/focus/active affordances */}
      <div className="pt-6">
        <button
          type="submit"
          title="Send Message"
          disabled={loading}
          className="
            btn-primary w-full
            transition duration-300 ease-in-out
            hover:bg-blue-700 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl
            focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offs
