"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { DbProduct } from "@/types";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/name-login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${params.productId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Product not found");
        }

        setProduct(data);
      } catch (error: any) {
        showToast(error.message || "Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };

    if (params.productId && user) {
      fetchProduct();
    }
  }, [params.productId, user, showToast]);

  const handlePaymentDone = async () => {
    if (!product || !user) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          productType: product.type,
          price: product.priceDkk,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process payment");
      }

      setShowThankYou(true);
    } catch (error: any) {
      showToast(error.message || "Failed to process payment", "error");
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-brown/70 py-12">Loading...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (!product) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brown mb-4">Product Not Found</h1>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (showThankYou) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-brown mb-4">Thank You!</h1>
            <p className="text-brown/70 mb-6">
              Thanks for the payment. It will be verified and you will be informed.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/my-purchases"
                className="px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
              >
                View My Purchases
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-colors font-medium"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-brown mb-8 text-center">Complete Your Payment</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Product Info */}
            <div>
              <h2 className="text-xl font-semibold text-brown mb-4">Order Details</h2>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-brown/70">Product</p>
                  <p className="text-lg font-semibold text-brown">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-brown/70">Price</p>
                  <p className="text-2xl font-bold text-brown">{product.priceDkk} DKK</p>
                </div>
                <div>
                  <p className="text-sm text-brown/70">Customer</p>
                  <p className="text-lg font-semibold text-brown">{user.name}</p>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-semibold text-brown mb-4">Scan to Pay</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-brown/20 mb-6 flex items-center justify-center">
                <img
                  src="/api/assets/qr"
                  alt="Payment QR Code"
                  className="w-[220px] h-[220px] object-contain"
                />
              </div>
              <p className="text-sm text-brown/70 text-center mb-6">
                Scan the QR code to complete payment, then click "Payment Done" below.
              </p>
            </div>
          </div>

          {/* Payment Done Button */}
          <div className="mt-8 pt-8 border-t border-brown/10">
            <button
              onClick={handlePaymentDone}
              disabled={processing}
              className="w-full py-4 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? "Processing..." : "Payment Done"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
