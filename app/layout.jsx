import "../src/index.css";
import Providers from "./providers";

export const metadata = {
  title: "Welcome",
  icons: {
    icon: { url: "/logo.svg", type: "image/svg+xml" },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
};

export default RootLayout;
