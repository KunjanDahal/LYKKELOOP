"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useModal } from "@/contexts/ModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { DbProduct } from "@/types";

export default function KeyringPage() {
  const router = useRouter();
  const { openModal } = useModal();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/keyring");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch products if user is authenticated
    if (!user) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products?type=keyring");
        const data = await response.json();
        if (response.ok) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  // Show loading or nothing while checking auth
  if (authLoading || !user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-brown/70 py-12">Loading...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-brown mb-4">
            Keyring
          </h1>
          <p className="text-lg text-brown/80 max-w-2xl mx-auto">
            Keep your keys cute and organized.
          </p>
        </div>
        {loading ? (
          <div className="text-center text-brown/70 py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center text-brown/70 py-12">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onProductClick={() => {
                  router.push(`/products/${product._id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}


