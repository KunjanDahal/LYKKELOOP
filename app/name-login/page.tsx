"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

function NameLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithName } = useAuth();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError("Name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await loginWithName(name.trim());
      showToast("Login successful! Welcome back.", "success");
      const redirectTo = searchParams.get("redirect") || "/";
      // Use window.location for full page reload to ensure cookie is available
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    } catch (error: any) {
      const errorMessage = error.message || "Something went wrong. Please try again.";
      setSubmitError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brown mb-2">LykkeLoop</h1>
          <p className="text-brown/70">Enter your name to continue</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-brown/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-brown mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-brown/20 rounded-lg focus:outline-none focus:border-rose transition-colors text-brown placeholder-brown/50"
                placeholder="Enter your name"
                disabled={isSubmitting}
                autoFocus
              />
              <p className="text-sm text-brown/60 mt-2">
                If you&apos;ve used this name before, you&apos;ll be logged into the same account.
              </p>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Please wait..." : "Continue"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-brown/60 text-sm mt-6">
          No password needed. Just enter your name to access your account.
        </p>
      </div>
    </div>
  );
}

export default function NameLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-beige flex items-center justify-center">
        <div className="text-brown/70">Loading...</div>
      </div>
    }>
      <NameLoginForm />
    </Suspense>
  );
}
