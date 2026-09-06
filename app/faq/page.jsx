import FaqSearch from "./FaqSearch";

export const metadata = {
  title: "FAQ and Tutorials — UnimeSpace",
  description:
    "Answers to common questions about UnimeSpace — boards, descs, tests and posts — plus step-by-step tutorials for creating a community, writing MCQ and coding questions, and publishing a test.",
  alternates: {
    canonical: "https://unime.space/faq",
  },
  openGraph: {
    title: "FAQ and Tutorials — UnimeSpace",
    description:
      "Answers to common questions about UnimeSpace — boards, descs, tests and posts — plus step-by-step tutorials for creating a community, writing MCQ and coding questions, and publishing a test.",
    url: "https://unime.space/faq",
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
    title: "FAQ and Tutorials — UnimeSpace",
    description:
      "Answers to common questions about UnimeSpace — boards, descs, tests and posts — plus step-by-step tutorials for creating a community, writing MCQ and coding questions, and publishing a test.",
    images: ["https://unime.space/og-default.png"],
  },
};

const FaqPage = () => {
  return (
    <main className="min-h-screen bg-neutral-100 dark:bg-neutral-950">
      <div className="px-4 py-10 sm:py-12 max-w-4xl mx-auto">
        <header className="mb-7">
          <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
            FAQ
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl">
            Quick answers + step-by-step tutorials for common tasks (creating
            descs, boards, tests, and posts).
          </p>
        </header>

        <FaqSearch />
      </div>
    </main>
  );
};

export default FaqPage;
