"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-semibold text-brown mb-2">Log in</h1>
          <p className="text-brown/70 mb-6">
            Welcome back to LykkeLoop
          </p>
          <AuthForm type="login" />
          <p className="text-center text-sm text-brown/70 mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-rose font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}



