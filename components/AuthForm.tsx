"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, signup } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
    sendDeals: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (type === "signup") {
      if (!formData.name) {
        newErrors.name = "Name is required";
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === "login") {
        await login(formData.email, formData.password);
        showToast("Login successful! Welcome back.", "success");
        const redirectTo = searchParams.get("redirect") || "/";
        // Use window.location for full page reload to ensure cookie is available
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 500);
      } else {
        await signup(formData.name, formData.email, formData.password);
        showToast("Account created successfully! Welcome to LykkeLoop.", "success");
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setSubmitError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {type === "signup" && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-brown mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"   
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.name
                ? "border-red-300"
                : "border-brown/20 focus:border-rose"
            } text-brown`}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brown mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
            errors.email
              ? "border-red-300"
              : "border-brown/20 focus:border-rose"
          } text-brown`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-brown mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
            errors.password
              ? "border-red-300"
              : "border-brown/20 focus:border-rose"
          } text-brown`}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      {type === "signup" && (
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-brown mb-1"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border-2 rounded-lg focus:outline-none transition-colors ${
              errors.confirmPassword
                ? "border-red-300"
                : "border-brown/20 focus:border-rose"
            } text-brown`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>
      )}

      {type === "login" && (
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 text-rose border-brown/20 rounded focus:ring-rose"
            />
            <span className="ml-2 text-sm text-brown/70">Remember me</span>
          </label>
          <a
            href="#forgot"
            className="text-sm text-rose hover:underline"
          >
            Forgot password?
          </a>
        </div>
      )}

      {type === "signup" && (
        <label className="flex items-center">
          <input
            type="checkbox"
            name="sendDeals"
            checked={formData.sendDeals}
            onChange={handleChange}
            className="w-4 h-4 text-rose border-brown/20 rounded focus:ring-rose"
          />
          <span className="ml-2 text-sm text-brown/70">
            Send me deals & early access
          </span>
        </label>
      )}

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Please wait..." : type === "login" ? "Log in" : "Sign up"}
      </button>
    </form>
  );
}

