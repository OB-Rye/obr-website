import OBRContactForm from "../../components/OBRContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-120px)]">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-muted to-transparent" />
        <div className="mx-auto max-w-5xl px-6 py-14 sm:py-20">
          <h1 className="text-4xl sm:text-5xl font-semibold">Get in touch</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Send a message and I’ll get back to you. The form works on desktop and mobile.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="card p-6 sm:p-10">
          <OBRContactForm />
        </div>
      </section>
    </div>
  );
}
