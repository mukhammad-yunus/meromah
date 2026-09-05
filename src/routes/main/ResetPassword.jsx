import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Toast from "../../components/Toast";
import SuccessModal from "./components/SuccessModal";
import { Link } from "react-router-dom";
import {
  useEmailVerificationForResetMutation,
  useOtpWithPasswordForResetMutation,
} from "../../services/authApi";

const ResetPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState({});
  const [isPasswordMatch, setIsPasswordMatch] = useState(true);
  const [toast, setToast] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [emailVerification, { isLoading: isVerifyingEmail }] =
    useEmailVerificationForResetMutation();
  const [resetPassword, { isLoading: isResetting }] =
    useOtpWithPasswordForResetMutation();

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
    setErrors({});

    if (!validateEmail(email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    try {
      const res = await emailVerification(email).unwrap();
      showToast(res.message, "info");
      setStep(2);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Failed to send verification code. Please try again.";
      showToast(errorMessage, "error");
    }
  };
  const handleRegistration = async () => {
    const newErrors = {};

    if (!validatePassword(newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!isPasswordMatch) {
      newErrors.newPasswordConfirmation = "Passwords do not match";
    }
    if (otp.length < 6) {
      setErrors({ otp: "Please enter a valid OTP code" });
      return;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await resetPassword({
        new_password: newPassword,
        new_password_confirmation: newPasswordConfirmation,
        email,
        otp,
      }).unwrap();
      setShowSuccessModal(true);
    } catch (err) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Reset process failed. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  const handlePasswordVerificationChange = (e) => {
    const value = e.target.value;
    setIsPasswordMatch(value === newPassword);
    setNewPasswordConfirmation(value);
    if (errors.newPasswordConfirmation) {
      setErrors({ ...errors, newPasswordConfirmation: "" });
    }
  };

  const handleBack = () => {
    setErrors({});
    if (step === 2) {
      setOtp("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      setStep(1);
    }
  };

  const handleResendCode = async () => {
    try {
      await emailVerification(email).unwrap();
      showToast("Verification code resent successfully!", "info");
    } catch (err) {
      const errorMessage =
        err?.data?.message || "Failed to resend code. Please try again.";
      showToast(errorMessage, "error");
    }
  };
  useEffect(() => {
    if (newPasswordConfirmation) {
      setIsPasswordMatch(newPasswordConfirmation === newPassword);
    }
  }, [newPassword, newPasswordConfirmation]);
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

      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          header={"Welcome to UnimeSpace!"}
          message={
            "Your password has been reset successfully. Redirecting you to login..."
          }
          path={"/login"}
        />
      )}

      <main className="px-4 py-16 max-w-md mx-auto dark:bg-neutral-950">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
            Reset Your Password
          </h1>
          <p className="text-neutral-700 dark:text-neutral-200">
            Enter a new password to regain access to your UnimeSpace account.
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
                    : "bg-gray-200 dark:bg-neutral-700 text-gray-500 dark:text-neutral-400"
                }`}
              >
                2
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-colors ${
                  step === 2
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-gray-500 dark:text-neutral-400"
                }`}
              >
                Reset Password
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

        {/* Step 2: Reset Password */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegistration();
            }}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow"
          >
            <div className="grid gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="otp"
                    className="font-medium text-neutral-800 dark:text-neutral-200"
                  >
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isVerifyingEmail}
                    className="text-sm text-primary-blue dark:text-blue-400 underline hover:no-underline disabled:opacity-50 cursor-pointer"
                  >
                    {isVerifyingEmail ? "Sending..." : "Resend Code"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  id="otp"
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
              </div>

              <label className="flex flex-col gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  Password
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword)
                      setErrors({ ...errors, newPassword: "" });
                  }}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    errors.newPassword
                      ? "border border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-0"
                      : "border border-neutral-200 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0"
                  }`}
                  required
                />
                {errors.newPassword && (
                  <span className="text-red-500 text-sm">
                    {errors.newPassword}
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
                  value={newPasswordConfirmation}
                  onChange={handlePasswordVerificationChange}
                  className={`px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 rounded-md focus:outline-none transition ${
                    !isPasswordMatch || errors.newPasswordConfirmation
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
                {errors.newPasswordConfirmation && (
                  <span className="text-red-500 text-sm">
                    {errors.newPasswordConfirmation}
                  </span>
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
                  disabled={isResetting || !isPasswordMatch}
                  className="btn-cta bg-primary-yellow text-neutral-900 font-semibold hover:bg-primary-yellow/90 w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all"
                >
                  {isResetting && <Loader2 className="animate-spin h-5 w-5" />}
                  {isResetting ? "Resetting Password..." : "Reset Password"}
                </button>
              </div>
            </div>
          </form>
        )}

        <p className="flex items-center gap-2 justify-center text-center text-neutral-700 dark:text-neutral-200 mt-4">
          <span>New here?</span>
          <Link
            to="/register"
            className="text-primary-blue dark:text-neutral-100 dark:font-semibold underline hover:no-underline"
          >
            Create an account
          </Link>
        </p>
      </main>
    </>
  );
};

export default ResetPassword;
