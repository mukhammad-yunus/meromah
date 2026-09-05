import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Terms = () => {
  const { hash } = useLocation();
  const [html, setHtml] = useState("");
  const iframeRef = useRef(null);

  useEffect(() => {
    fetch(`${VITE_API_BASE_URL}/api/terms`)
      .then((res) => res.text())
      .then((rawHtml) => {
        const isDark = document.documentElement.classList.contains("dark");

        const styledHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8" />
              <style>
                body {
                  margin: 0;
                  padding: 24px;
                  font-family: system-ui, -apple-system, BlinkMacSystemFont;
                  background-color: ${isDark ? "#0a0a0a" : "#ffffff"};
                  color: ${isDark ? "#f5f5f5" : "#000000"};
                }

                h1, h2, h3, h4 {
                  color: ${isDark ? "#fafafa" : "#000000"};
                }

                a {
                  color: ${isDark ? "#93c5fd" : "#2563eb"};
                }
              </style>
            </head>
            <body>
              ${rawHtml}
            </body>
          </html>
        `;

        setHtml(styledHtml);
      });
  }, []);

  // Scroll inside iframe
  useEffect(() => {
    if (!hash || !iframeRef.current) return;

    const iframe = iframeRef.current;

    const scrollToHash = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const el = doc.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    };

    iframe.addEventListener("load", scrollToHash);
    scrollToHash();

    return () => iframe.removeEventListener("load", scrollToHash);
  }, [hash, html]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={html}
      title="Terms and Conditions"
      className="w-full h-screen border-none"
    />
  );
};

export default Terms;
