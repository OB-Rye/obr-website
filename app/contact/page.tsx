
import type React from "react";
import V0ContactClient from "../../components/V0ContactClient";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Hero / Intro */}
      <section className="text-center py-16 px-6">
        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full px-6 py-3 mb-8 border border-emerald-200/30">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-emerald-700 font-semibold text-sm tracking-wide uppercase">
            Let&apos;s Connect
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 leading-tight">
          Thank you for visiting!
        </h1>

        <p className="max-w-3xl mx-auto text-xl sm:text-2xl text-slate-600 leading-relaxed mb-6">
          Whether you&apos;re curious about my{" "}
          <span className="font-semibold text-emerald-600">seminars</span>,
          exploring <span className="font-semibold text-blue-600">coaching</span>, 
          or interested in{" "}
          <span className="font-semibold text-purple-600">consulting</span>,
          I would love to hear from you.
        </p>
        <p className="text-lg text-slate-500">
          Please leave me a note below, and I&apos;ll get back to you as soon as I can.
        </p>
      </section>

      {/* Contact Form Card */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl shadow-2xl p-8 sm:p-12">
          <V0ContactClient className="space-y-8">
            {/* Honeypot (anti-spam) */}
            <input type="text" name="_hp" className="hidden" tabIndex={-1} autoComplete="off" />

            {/* Name fields */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  required
                  className="input"
                  placeholder="Your first name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  required
                  className="input"
                  placeholder="Your last name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input"
                placeholder="your.email@company.com"
              />
            </div>

            {/* Company + Country */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="company" className="label">
                  Company
                </label>
                <input id="company" name="company" className="input" placeholder="Your company name" />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="label">
                  Country
                </label>
                <input id="country" name="country" className="input" placeholder="Your country" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="label">
                Phone Number
              </label>
              <input id="phone" name="phone" type="tel" className="input" placeholder="+1 (555) 123-4567" />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label htmlFor="subject" className="label">
                Subject
              </label>
              <input id="subject" name="subject" className="input" placeholder="How can I help you?" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label htmlFor="message" className="label">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                className="input min-h-[120px]"
                placeholder="Tell me about your goals, challenges, or questions..."
              />
            </div>

            {/* Areas of Interest (like v0) */}
            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-lg font-semibold text-slate-700 mb-4">Areas of Interest</h3>
              <p className="text-slate-600 mb-6">Select one or more areas you&apos;d like to explore:</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {["Seminars", "Coaching", "Team Workshops", "Strategic Consulting"].map((interest) => (
                  <label
                    key={interest}
                    className="checkcard cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      name="interests"
                      value={interest}
                      className="rounded mr-2"
                    />
                    <span>{interest}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit button is rendered by V0ContactClient */}
          </V0ContactClient>
        </div>
      </section>

      {/* Direct Contact */}
      <section className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <div className="bg-gradient-to-r from-slate-100/80 to-blue-100/80 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Prefer to Connect Directly?</h3>
          <p className="text-slate-600">
            You can always email me directly at{" "}
            <a href="mailto:obrye@obrye.global" className="text-emerald-600 font-medium hover:underline">
              obrye@obrye.global
            </a>{" "}
            or connect with me on{" "}
            <a
              href="https://www.linkedin.com/in/bentrye/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-medium hover:underline"
            >
              LinkedIn
            </a>.
          </p>
        </div>
      </section>
    </div>
  );
}
