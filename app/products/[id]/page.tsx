"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
          {/* Product Images */}
          <div>
            {/* Main Image */}
            <div className="aspect-square bg-beige rounded-2xl overflow-hidden mb-4">
              {(() => {
                const images: string[] = (product.images && product.images.length > 0) ? product.images : (product.imageUrl ? [product.imageUrl] : []);
                const mainImage = images[selectedImageIndex] || images[0];
                
                return mainImage ? (
                  <Image
                    src={mainImage}
                    alt={product.name}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brown/50">
                    No Image
                  </div>
                );
              })()}
            </div>
            
            {/* Image Thumbnails */}
            {(() => {
              const images: string[] = (product.images && product.images.length > 0) ? product.images : (product.imageUrl ? [product.imageUrl] : []);
              
              if (images.length > 1) {
                return (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImageIndex === index
                            ? "border-rose ring-2 ring-rose/20"
                            : "border-brown/20 hover:border-brown/40"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                );
              }
              return null;
            })()}
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

