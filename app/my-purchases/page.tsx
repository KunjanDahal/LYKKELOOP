"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface Purchase {
  id: string;
  productId: string;
  productName: string;
  productType: "earrings" | "cap" | "glooves" | "keyring";
  price: number;
  verificationStatus: "pending" | "received" | "not_received";
  createdAt: string;
  updatedAt: string;
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  earrings: "Earrings",
  cap: "Cap",
  glooves: "Glooves",
  keyring: "Keyring",
};

const STATUS_LABELS: Record<string, { text: string; color: string }> = {
  pending: { text: "Pending Verification", color: "bg-yellow-100 text-yellow-700" },
  received: { text: "Payment Received", color: "bg-green-100 text-green-700" },
  not_received: { text: "Payment Not Received", color: "bg-red-100 text-red-700" },
};

export default function MyPurchasesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/name-login?redirect=/my-purchases");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchPurchases = async () => {
      // Don't fetch if user is not authenticated
      if (!user || authLoading) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/purchases", {
          credentials: "include",
        });

        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push("/name-login?redirect=/my-purchases");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch purchases");
        }

        const data = await response.json();
        setPurchases(data.purchases || []);
      } catch (error: any) {
        console.error("Failed to fetch purchases:", error);
        if (error.message?.includes("Unauthorized") || error.message?.includes("log in")) {
          router.push("/name-login?redirect=/my-purchases");
        } else {
          showToast(error.message || "Failed to load purchases", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch when user is confirmed authenticated and not loading
    if (user && !authLoading) {
      fetchPurchases();
    }
  }, [user, authLoading, router, showToast]);

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

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold text-brown mb-8">My Purchases</h1>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <p className="text-brown/70 text-lg mb-6">You haven&apos;t made any purchases yet.</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-rose/5 border-b border-brown/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-brown">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brown/10">
                  {purchases.map((purchase) => {
                    const status = STATUS_LABELS[purchase.verificationStatus] || STATUS_LABELS.pending;
                    return (
                      <tr key={purchase.id} className="hover:bg-brown/5 transition-colors">
                        <td className="px-6 py-4">
                          <Link
                            href={`/products/${purchase.productId}`}
                            className="font-semibold text-brown hover:text-rose transition-colors"
                          >
                            {purchase.productName}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-brown/80">
                          {PRODUCT_TYPE_LABELS[purchase.productType] || purchase.productType}
                        </td>
                        <td className="px-6 py-4 text-brown font-semibold">{purchase.price} DKK</td>
                        <td className="px-6 py-4 text-brown/70 text-sm">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                          >
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-brown/10">
              {purchases.map((purchase) => {
                const status = STATUS_LABELS[purchase.verificationStatus] || STATUS_LABELS.pending;
                return (
                  <div key={purchase.id} className="p-4">
                    <Link
                      href={`/products/${purchase.productId}`}
                      className="font-semibold text-brown hover:text-rose transition-colors block mb-2"
                    >
                      {purchase.productName}
                    </Link>
                    <div className="flex items-center justify-between text-sm text-brown/70 mb-2">
                      <span>{PRODUCT_TYPE_LABELS[purchase.productType] || purchase.productType}</span>
                      <span className="font-semibold text-brown">{purchase.price} DKK</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-brown/60">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
