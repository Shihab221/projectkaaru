"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  login,
  signup,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthInitialized,
  clearError,
} from "@/redux/slices/authSlice";
import toast from "react-hot-toast";

type AuthMode = "login" | "signup";

function AuthPageContent() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const authInitialized = useAppSelector(selectAuthInitialized);

  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    // Only redirect once auth is initialized and user is authenticated
    if (authInitialized && isAuthenticated) {
      // If redirect is to admin pages, check if user is admin
      if (redirect.startsWith("/admin")) {
        if (isAdmin) {
          router.replace(redirect);
        } else {
          // User is not admin, redirect to profile instead
          router.replace("/profile");
        }
      } else {
        router.replace(redirect);
      }
    }
  }, [authInitialized, isAuthenticated, isAdmin, redirect, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "login") {
      const result = await dispatch(
        login({ email: formData.email, password: formData.password })
      );
      if (login.fulfilled.match(result)) {
        toast.success("Welcome back!");
        router.push(redirect);
      }
    } else {
      if (!formData.name.trim()) {
        toast.error("Please enter your name");
        return;
      }
      const result = await dispatch(
        signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      );
      if (signup.fulfilled.match(result)) {
        toast.success("Account created successfully!");
        router.push(redirect);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-secondary">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 mt-2">
            {mode === "login"
              ? "Sign in to your account"
              : "Join ProjectKaaru today"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              mode === "login"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:text-secondary"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
              mode === "signup"
                ? "bg-white text-secondary shadow-sm"
                : "text-gray-500 hover:text-secondary"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium text-secondary mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input pl-12"
                  placeholder="John Doe"
                  required={mode === "signup"}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input pl-12"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="input pl-12 pr-12"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {mode === "login" && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full mt-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Terms */}
        {mode === "signup" && (
          <p className="text-xs text-gray-500 text-center mt-4">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-8 h-8 bg-white/20 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
