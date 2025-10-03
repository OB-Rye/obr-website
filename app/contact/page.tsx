import OBRContactForm from "../../components/OBRContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-120px)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden v0-hero">
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h1 className="v0-title text-4xl sm:text-5xl">
            Let’s Connect
          </h1>
          <p className="mt-4 max-w-2xl v0-subtle text-lg">
            Prefer to connect directly?{" "}
            <a href="mailto:obrye@obrye.global" className="v0-link">
              Send me an email
            </a>
            , or use the form below and I’ll get back to you shortly.
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card p-6 sm:p-10">
          <OBRContactForm />
        </div>
      </section>
    </div>
  );
}
