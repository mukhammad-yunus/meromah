"use client";

import React, { useEffect, useState } from "react";
import Toast from "../../src/components/Toast";
import { useContactUsMutation } from "../../src/services/contactApi";
import AutoResizeTextarea from "../../src/routes/user/components/AutoResizeTextarea";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const ContactForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const [error, setError] = useState({ hasError: false, message: null });
  const [submitContact, { isLoading }] = useContactUsMutation();
  const [submitted, setSubmitted] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return null;
    try {
      await submitContact({ data: formData }).unwrap();
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        body: "",
      });
    } catch (err) {
      setError({
        hasError: true,
        message: err.data.message,
      });
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      const isValuesValid = new Set();
      for (const value of Object.values(formData)) {
        isValuesValid.add(Boolean(value.trim()));
      }
      setIsValid(!isValuesValid.has(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [formData]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8 md:p-10"
      >
        <div className="space-y-7">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2"
              >
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2"
            >
              Subject
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
            >
              <option value="">Choose one...</option>
              <option value="general">General Inquiry</option>
              <option value="support">Support Request</option>
              <option value="feedback">Feedback</option>
              <option value="collaboration">Collaboration</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="body"
              className="block text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-2"
            >
              Your Message
            </label>
            <AutoResizeTextarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              required
              className="w-full min-h-[33vh] px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition resize-none"
              placeholder="Tell us more about how we can help..."
            />
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className="w-full bg-primary-blue text-white font-semibold py-4 px-6 rounded-lg hover:bg-primary-blue/90 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 border border-primary-blue dark:border-neutral-100 focus:outline-none focus:ring-4 focus:ring-primary-blue/30 transition-colors disabled:opacity-70 dark:disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending Message..." : "Send Message"}
          </button>
        </div>
      </form>

      <button
        type="button"
        aria-label="Go back"
        className="absolute top-4 left-4 cursor-pointer"
        onClick={() => router.back()}
      >
        <ChevronLeft aria-hidden="true" className="w-7 h-7 text-neutral-800 dark:text-neutral-200 hover:text-neutral-600 dark:hover:text-neutral-400" />
      </button>

      {submitted && (
        <Toast
          message={
            <span>
              Thank you! Your message has been sent successfully. We’ll get back
              to you soon.
            </span>
          }
          type="success"
          onClose={() => setSubmitted(false)}
        />
      )}
      {error.hasError && (
        <Toast
          message={error.message}
          type="error"
          onClose={() => setError({ hasError: false, message: null })}
        />
      )}
    </>
  );
};

export default ContactForm;
