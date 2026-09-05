import React, { useState } from "react";
import { useLoginMutation } from "../../services/authApi";
import SuccessModal from "./components/SuccessModal";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { setIsAuthenticated } from "../../app/authSlice";
import Toast from "../../components/Toast";
import { Link } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState({ hasError: false, message: null });
  const [login, { isLoading, isError }] = useLoginMutation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({
        email,
        password,
      }).unwrap();
      dispatch(setIsAuthenticated(true))
      setShowSuccessModal(true);
      setEmail("");
      setPassword("");
    } catch (err) {
      setError({ hasError: true, message: err.data.message });
    }
  };
  return (
    <main className="px-4 py-16 max-w-md mx-auto dark:bg-neutral-950">
      {showSuccessModal && (
        <SuccessModal
          onClose={() => setShowSuccessModal(false)}
          header={"Welcome to UnimeSpace!"}
          message={
            "Your logged in to your account successfully. Redirecting..."
          }
          path={sessionStorage.getItem("last-visit") || "/home"}
        />
      )}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
          Welcome back
        </h1>
        <p className="text-neutral-700 dark:text-neutral-200">
          Sign in to post, not to spy — your info stays private.
        </p>
      </header>

      <form
        onSubmit={(e) => handleSubmit(e)}
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 sm:p-8 shadow"
      >
        <div className="grid gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-medium text-neutral-800 dark:text-neutral-100">Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
              required
            />
          </label>
          <div className="space-y-2">
            <label className="flex flex-col gap-2">
              <span className="font-medium text-neutral-800 dark:text-neutral-100">Password</span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 pt-1 pb-1.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-none focus:bg-white dark:focus:bg-neutral-900 focus:border-neutral-300 dark:focus:border-neutral-600 focus:ring-4 focus:ring-neutral-100 dark:focus:ring-0 transition"
                required
              />
            </label>
            {isError&&<p className="flex items-center gap-2 text-neutral-700 dark:text-neutral-200 text-xs">
              <span>Forgot your password?</span>
              <Link to="/reset-password" className="text-primary-blue underline dark:text-neutral-100 dark:font-semibold">
                Reset
              </Link>
            </p>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center w-full py-2 px-4 rounded-lg bg-primary-blue text-white text-base font-medium text-center hover:bg-primary-blue/90 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-neutral-100 border border-primary-blue dark:border-neutral-100 transition-colors cursor-pointer"
          >
            <span>{isLoading ? "Logging in..." : "Log In"}</span>
            {isLoading && (
              <Loader2 className="animate-spin text-white dark:text-neutral-900 text-lg" />
            )}
          </button>
        </div>
      </form>

      <p className="flex items-center gap-2 justify-center text-center text-neutral-700 dark:text-neutral-200 text-sm mt-4">
        <span>New here?</span>
        <Link to="/register" className="text-primary-blue underline dark:text-neutral-100 dark:font-semibold">
          Create an account
        </Link>
      </p>
      {error.hasError && (
        <Toast
          message={error.message}
          onClose={() => setError({ hasError: false, message: null })}
          time={10000}
          type="error"
          key={"login-error"}
        />
      )}
    </main>
  );
};

export default Login;
