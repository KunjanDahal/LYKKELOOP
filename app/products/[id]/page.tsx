"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useModal } from "@/contexts/ModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { DbProduct, ProductType } from "@/types";

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  earrings: "Earrings",
  cap: "Cap",
  glooves: "Glooves",
  keyring: "Keyring",
};

const PRODUCT_TYPE_ROUTES: Record<ProductType, string> = {
  earrings: "/earrings",
  cap: "/cap",
  glooves: "/glooves",
  keyring: "/keyring",
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { openModal } = useModal();
  const { user } = useAuth();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Product not found");
        }

        setProduct(data);
      } catch (error: any) {
        setError(error.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handlePayClick = () => {
    if (!user) {
      openModal();
    } else {
      // Placeholder for future payment integration
      // For now, show an alert or redirect to a checkout page when implemented
      alert("Payment flow coming soon! This will redirect to checkout.");
      // router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-brown/70 py-12">Loading product...</div>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-brown mb-4">Product Not Found</h1>
            <p className="text-brown/70 mb-6">{error || "The product you're looking for doesn't exist."}</p>
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

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Back Link */}
        <Link
          href={PRODUCT_TYPE_ROUTES[product.type]}
          className="inline-flex items-center text-brown/70 hover:text-brown mb-8 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to {PRODUCT_TYPE_LABELS[product.type]}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-beige rounded-2xl overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='800'%3E%3Crect fill='%23f5f5dc' width='800' height='800'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%238B4513' font-size='48'%3ENo Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-rose/20 text-brown text-sm rounded-full mb-4">
                Category: {PRODUCT_TYPE_LABELS[product.type]}
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-brown mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-brown mb-6">{product.priceDkk} DKK</p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-brown mb-3">Description</h2>
              <p className="text-brown/80 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            <div className="mt-auto">
              <button
                onClick={handlePayClick}
                className="w-full py-4 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium text-lg"
              >
                {user ? "Pay now" : "Login to purchase"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

