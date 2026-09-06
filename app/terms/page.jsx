import { readFile } from "node:fs/promises";
import path from "node:path";

export const metadata = {
  title: "Terms and Conditions — UnimeSpace",
  description:
    "The Terms and Conditions of Service for the UnimeSpace educational technology platform: the agreement covering account registration, user-generated content, acceptable use, and the rights and obligations of everyone using the platform.",
  alternates: {
    canonical: "https://unime.space/terms",
  },
  openGraph: {
    title: "Terms and Conditions — UnimeSpace",
    description:
      "The Terms and Conditions of Service for the UnimeSpace educational technology platform: the agreement covering account registration, user-generated content, acceptable use, and the rights and obligations of everyone using the platform.",
    url: "https://unime.space/terms",
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
    title: "Terms and Conditions — UnimeSpace",
    description:
      "The Terms and Conditions of Service for the UnimeSpace educational technology platform: the agreement covering account registration, user-generated content, acceptable use, and the rights and obligations of everyone using the platform.",
    images: ["https://unime.space/og-default.png"],
  },
};

// The document is a local, first-party file with no request-dependent input, so the route
// is prerendered once at build time and served as static HTML on every request.
export const dynamic = "force-static";

// terms.html carries no classes of its own, and Tailwind's Preflight strips the default
// margins and sizes off every element, so the typography is applied here by descendant
// variant. The source document uses empty <p></p> elements as spacers; they are hidden
// rather than stripped, since the real spacing comes from the margins below.
const documentStyles = [
  "[&_p:empty]:hidden",
  "[&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:text-neutral-900 sm:[&_h1]:text-4xl dark:[&_h1]:text-neutral-100",
  "[&_h2]:mb-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-neutral-600 dark:[&_h2]:text-neutral-400",
  "[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:scroll-mt-6 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-neutral-900 sm:[&_h3]:text-xl dark:[&_h3]:text-neutral-100",
  "[&_p]:mb-4 [&_p]:leading-7",
  "[&_strong]:font-semibold [&_strong]:text-neutral-900 dark:[&_strong]:text-neutral-100",
  "[&_em]:italic [&_i]:italic [&_u]:underline",
  "[&_a]:text-primary-blue [&_a]:underline hover:[&_a]:no-underline dark:[&_a]:text-blue-400",
  "[&_hr]:my-8 [&_hr]:border-neutral-200 dark:[&_hr]:border-neutral-800",
  "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_li]:mb-2 [&_li]:leading-7",
].join(" ");

const TermsPage = async () => {
  const termsHtml = await readFile(
    path.join(process.cwd(), "app/terms/terms.html"),
    "utf8"
  );

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div
        className={`mx-auto max-w-3xl px-6 py-12 text-sm text-neutral-700 sm:text-base dark:text-neutral-300 ${documentStyles}`}
        dangerouslySetInnerHTML={{ __html: termsHtml }}
      />
    </main>
  );
};

export default TermsPage;
