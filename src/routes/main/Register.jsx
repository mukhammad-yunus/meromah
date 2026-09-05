import React, { useEffect, useState } from "react";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import {
  useEmailVerificationMutation,
  useOtpVerificationMutation,
  useRegisterUserMutation,
  useCheckIsUsernameAvailableQuery,
} from "../../services/authApi";
import Toast from "../../components/Toast";
import SuccessModal from "./components/SuccessModal";
import NameAvailabilityInput from "../../components/NameAvailabilityInput";

// Default form values
const DEFAULT_FORM_VAL = {
  name: "",
  username: "",
  password: "",
  password_confirmation: "",
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM_VAL);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailVerification, { isLoading: isVerifyingEmail }] =
    useEmailVerificationMutation();
  const [otpVerification, { isLoading: isVerifyingOtp }] =
    useOtpVerificationMutation();
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();

  // useEffect to handle API errors and show toast
  useEffect(() => {
    if (!apiError) return;
    showToast(apiError, "error");
  }, [apiError]);

  // Function to show toast notifications
  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };
  // Validation functions
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };
  // Handlers for each step
  const handleEmailVerification = async () => {
    setApiError("");
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    try {
      const res = await emailVerification(email).unwrap();
      setToast({ message: res.message, type: "info" });
      setStep(2);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to send verification code. Please try again.";
      setApiError(errorMessage);
      console.error("Email verification failed:", err);
    }
  };

  const handleOtpVerification = async () => {
    setApiError("");
    setErrors({});

    if (otp.length < 6) {
      setErrors({ otp: "Please enter a valid OTP code" });
      return;
    }

    try {
      const res = await otpVerification({ otp, email }).unwrap();
      setStep(3);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Invalid verification code. Please try again.";
      setApiError(errorMessage);
      console.error("OTP verification failed:", err);
    }
  };

  const handleRegistration = async () => {
    setApiError("");
    const newErrors = {};

    if (form.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }
    if (!isUsernameValid) {
      newErrors.username = "Please enter a valid and available username";
    }
    if (!validatePassword(form.password)) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!isPasswordMatch) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const userData = { ...form, email };
      await registerUser(userData).unwrap();
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setApiError(errorMessage);
      console.error("Registration failed:", err);
    }
  };

  const handlePasswordVerificationChange = (e) => {
    const value = e.target.value;
    setIsPasswordMatch(value === form.password);
    setForm({ ...form, password_confirmation: value });
    if (errors.password_confirmation) {
      setErrors({ ...errors, password_confirmation: "" });
    }
  };

  const handleBack = () => {
    setApiError("");
    setErrors({});
    if (step === 2) {
      setOtp("");
      setStep(1);
    } else if (step === 3) {
      setForm(DEFAULT_FORM_VAL);
      setStep(2);
    }
  };

  const handleResendCode = async () => {
    setApiError("");
    try {
      await emailVerification(email).unwrap();
      showToast("Verification code resent successfully!", "info");
    } catch (err) {
      const errorMessage =
        err?.data?.message || "Failed to resend code. Please try again.";
      setApiError(errorMessage);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          time={20000}
        />
      )}

      {/* Special Character Warning Toast */}
      {hasSpecialChar && (
        <Toast
          type="error"
          message={
            <span>
              <strong>Oops!</strong> Username can only contain{" "}
              <strong>letters, numbers, and underscores (_).</strong>
            </span>
          }
          onClose={() => setHasSpecialChar(false)}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          header={"Welcome to UnimeSpace!"}
          message={
            "Your account has been created successfully. Redirecting you to home..."
          }
          path={"/home"}
        />
      )}

      <main className="px-4 py-16 max-w-md mx-auto dark:bg-neutral-950">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
            Join UnimeSpace
          </h1>
          <p className="text-neutral-700 dark:text-neutral-200">
            Create your account and start learning, sharing, and vibing.
          </p>
        </header>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            {/* Progress Bar Background */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-neutral-700 -z-10 dark:z-0" />

            {/* Active Progress Bar */}
            <div
              className="absolute top-5 left-0 h-0.5 bg-primary-yellow transition-all duration-500 ease-out -z-10 dark:z-0"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />

            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1 dark:z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 1
                    ? "bg-primary-yellow text-neutral-900 shadow-md"
                    : "bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400"
                }`}
              >
                {step > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  step === 1
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                Verify Email
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1 dark:z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 2
                    ? "bg-primary-yellow text-neutral-900 shadow-md"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  step === 2
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                Enter Code
              </span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1 dark:z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step >= 3
                    ? "bg-primary-yellow text-neutral-900 shadow-md"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                3
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  step === 3
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                Create Account
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Email Verification */}
        {step === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleEmailVerification();
            }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow"
          >
            <div className="grid gap-6">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-100">
                  Email
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: "" });
                  }}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    errors.email
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {errors.email && (
                  <span className="text-red-500 text-sm">{errors.email}</span>
                )}
              </label>

              <button
                type="submit"
                disabled={isVerifyingEmail}
                className="btn-cta bg-primary-yellow text-neutral-900 font-semibold hover:bg-primary-yellow/90 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
              >
                {isVerifyingEmail && (
                  <Loader2 className="animate-spin h-5 w-5" />
                )}
                {isVerifyingEmail ? "Sending Code..." : "Verify Email"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleOtpVerification();
            }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow"
          >
            <div className="grid gap-6">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Verification Code
                </span>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    if (errors.otp) setErrors({ ...errors, otp: "" });
                  }}
                  maxLength={6}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    errors.otp
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {errors.otp && (
                  <span className="text-red-500 text-sm">{errors.otp}</span>
                )}
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isVerifyingOtp}
                  className="btn-cta bg-primary-yellow text-neutral-900 font-semibold hover:bg-primary-yellow/90 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
                >
                  {isVerifyingOtp && (
                    <Loader2 className="animate-spin h-5 w-5" />
                  )}
                  {isVerifyingOtp ? "Verifying..." : "Verify Code"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isVerifyingEmail}
                className="text-sm text-primary-blue dark:text-blue-400 underline hover:no-underline disabled:opacity-50"
              >
                {isVerifyingEmail ? "Sending..." : "Resend Code"}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Registration Form */}
        {step === 3 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow"
          >
            <div className="grid gap-6">
              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Name
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    errors.name
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">{errors.name}</span>
                )}
              </label>

              <div>
                <NameAvailabilityInput
                  value={form.username}
                  onChange={(value ) => {
                    setForm({ ...form, username: value });
                    if (errors.username) setErrors({ ...errors, username: "" });
                  }}
                  useCheckAvailabilityQuery={useCheckIsUsernameAvailableQuery}
                  label="Username"
                  placeholder="johndoe"
                  inputType="username"
                  onValidationChange={(isValid) => setIsUsernameValid(isValid)}
                  onSpecialCharDetected={setHasSpecialChar}
                  required
                />
                {errors.username && (
                  <span className="text-red-500 text-sm mt-1 block">
                    {errors.username}
                  </span>
                )}
              </div>
              {/* Prevents auto complete */}
              <input
                type="text"
                name="fake-user"
                autoComplete="username"
                style={{ display: "none" }}
              />
              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    errors.password
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Confirm Password
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password_confirmation}
                  onChange={handlePasswordVerificationChange}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    !isPasswordMatch || errors.password_confirmation
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {!isPasswordMatch && (
                  <span className="text-red-500 text-sm">
                    Passwords do not match
                  </span>
                )}
                {errors.password_confirmation && (
                  <span className="text-red-500 text-sm">
                    {errors.password_confirmation}
                  </span>
                )}
              </label>
              <div className="rounded-md bg-yellow-50 dark:bg-neutral-900/70 border border-yellow-200 dark:border-neutral-700 p-4 my-2 flex items-start gap-2 text-sm">
                <CircleAlert
                  className="h-5 w-5 mt-0.5 text-yellow-500 dark:text-yellow-400 flex-shrink-0"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-neutral-800 dark:text-neutral-200 mb-1">
                    Please review our{" "}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-blue dark:text-neutral-100 font-semibold underline hover:text-primary-yellow dark:hover:text-primary-yellow transition"
                    >
                      Terms &amp; Conditions
                    </a>{" "}
                    before completing your registration.
                  </p>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    By registering, you agree to our platform's terms and
                    conditions.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isRegistering || !isPasswordMatch}
                  className="btn-cta bg-primary-yellow text-neutral-900 font-semibold hover:bg-primary-yellow/90 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
                >
                  {isRegistering && (
                    <Loader2 className="animate-spin h-5 w-5" />
                  )}
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </div>
          </form>
        )}

        <p className="text-center text-neutral-700 dark:text-neutral-200 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary-blue dark:text-neutral-100 dark:font-semibold underline hover:no-underline"
          >
            Login
          </a>
        </p>
      </main>
    </>
  );
};

export default Register;
