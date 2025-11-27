"use client";

import { Suspense } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

function SignupForm() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-semibold text-brown mb-2">Sign up</h1>
      <p className="text-brown/70 mb-6">
        Join LykkeLoop and get 10% off your first order
      </p>
      <AuthForm type="signup" />
      <p className="text-center text-sm text-brown/70 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-rose font-medium hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <Suspense fallback={<div className="text-center text-brown/70 py-12">Loading...</div>}>
          <SignupForm />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}



