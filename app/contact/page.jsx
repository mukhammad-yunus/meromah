import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact UnimeSpace",
  description:
    "Get in touch with the UnimeSpace team. Send a general enquiry, a support request, feedback on the platform, or a collaboration proposal — we read every message and respond promptly.",
  alternates: {
    canonical: "https://unime.space/contact",
  },
  openGraph: {
    title: "Contact UnimeSpace",
    description:
      "Get in touch with the UnimeSpace team. Send a general enquiry, a support request, feedback on the platform, or a collaboration proposal — we read every message and respond promptly.",
    url: "https://unime.space/contact",
    siteName: "UnimeSpace",
    type: "website",
    images: [
      {
        url: "https://unime.space/og-default.png",
        width: 1200,
        height: 630,
        alt: "UnimeSpace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact UnimeSpace",
    description:
      "Get in touch with the UnimeSpace team. Send a general enquiry, a support request, feedback on the platform, or a collaboration proposal — we read every message and respond promptly.",
    images: ["https://unime.space/og-default.png"],
  },
};

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-200 max-w-2xl mx-auto leading-relaxed">
            We'd love to hear from you. Whether it's a question, feedback, or
            just a hello — drop us a line and we'll respond promptly.
          </p>
        </header>

        <ContactForm />
      </div>
    </main>
  );
};

export default ContactPage;
