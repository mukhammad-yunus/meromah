import AboutUs from "../../src/routes/main/AboutUs";

export const metadata = {
  title: "About UnimeSpace",
  description:
    "The story behind UnimeSpace — a platform built by UniMe students, for UniMe students. From a small DSA exam-prep site to a community-driven space for tests, posts, and shared study materials.",
  alternates: {
    canonical: "https://unime.space/about",
  },
  openGraph: {
    title: "About UnimeSpace",
    description:
      "The story behind UnimeSpace — a platform built by UniMe students, for UniMe students. From a small DSA exam-prep site to a community-driven space for tests, posts, and shared study materials.",
    url: "https://unime.space/about",
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
    title: "About UnimeSpace",
    description:
      "The story behind UnimeSpace — a platform built by UniMe students, for UniMe students. From a small DSA exam-prep site to a community-driven space for tests, posts, and shared study materials.",
    images: ["https://unime.space/og-default.png"],
  },
};

const AboutPage = () => {
  return <AboutUs />;
};

export default AboutPage;
