"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const interestOptions = [
    "Seminars",
    "Coaching",
    "Team Workshops",
    "Strategic Consulting",
  ] as const;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Optional honeypot check (bots will often fill this)
    const honeypot = (formData.get("website") || "").toString();
    if (honeypot) {
      setIsSubmitting(false);
      setError("Something went wrong, please try again.");
      return;
    }

    // Soft client-side validations mirroring server
    const name = (formData.get("name") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const message = (formData.get("message") || "").toString().trim();

    if (!name || !email || !message) {
      setIsSubmitting(false);
      setError("Please fill in name, email and message.");
      return;
    }
    if (name.length > 200) {
      setIsSubmitting(false);
      setError("Name is too long.");
      return;
    }
    if (email.length > 320) {
      setIsSubmitting(false);
      setError("Email is too long.");
      return;
    }
    if (message.length > 5000) {
      setIsSubmitting(false);
      setError("Message is too long.");
      return;
    }

    // Collect native checkbox values
    const interests = formData.getAll("interests").map(String);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company: (formData.get("company") || "").toString(),
          country: (formData.get("country") || "").toString(),
          phone: (formData.get("phone") || "").toString(),
          interests,
          message,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        throw new Error(data.error || "Failed to send message");
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong, please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-lg w-full bg-white/90 backdrop-blur-sm shadow-xl">
          <CardContent className="p-10 text-center">
            <h1 className="text-2xl font-bold mb-4">✅ Thank You!</h1>
            <p className="text-slate-600 mb-6">
              Your message has been sent. I’ll get back to you as soon as possible.
            </p>
            <Button onClick={() => (window.location.href = "/")}>
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 sm:p-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Contact Me</h1>
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Honeypot (hidden) */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Basic Fields */}
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required autoComplete="name" maxLength={200} />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" name="email" required autoComplete="email" maxLength={320} />
            </div>

            {/* Extra Fields */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" autoComplete="organization" />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" autoComplete="country-name" />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" name="phone" autoComplete="tel" />
            </div>

            {/* Interests (use native inputs so FormData works) */}
            <div>
              <Label className="mb-2 block">Areas of Interest</Label>
              <div className="grid sm:grid-
