"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CategoryCard from "@/components/CategoryCard";
import ProductCard from "@/components/ProductCard";
import { useModal } from "@/contexts/ModalContext";
import { useAuth } from "@/contexts/AuthContext";
import { categories, products } from "@/data/products";

export default function Home() {
  const { openModal } = useModal();
  const { user } = useAuth();

  // Get one featured product from each category
  const featuredProducts = [
    products.find((p) => p.category === "earrings")!,
    products.find((p) => p.category === "cap")!,
    products.find((p) => p.category === "glooves")!,
    products.find((p) => p.category === "keyring")!,
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-rose/20 text-brown rounded-full text-sm font-medium">
            New in Denmark · Budget-friendly accessories
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown leading-tight">
            Feel Lykke in Every Loop.
          </h1>
          <p className="text-lg text-brown/80 leading-relaxed max-w-2xl mx-auto">
            Discover affordable earrings and accessories designed for everyday wear. 
            Quality pieces that bring joy to your daily style.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/earrings"
              className="px-8 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-all hover:scale-105 shadow-lg font-medium text-center"
            >
              Shop all earrings
            </Link>
            <a
              href="#categories"
              className="px-8 py-2 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-all hover:scale-105 font-medium text-center"
            >
              Browse all categories
            </a>
          </div>
        </div>
      </section>

      {/* Category Cards Section */}
      <section id="categories" className="container mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-brown text-center mb-12">
          Shop by category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-brown text-center mb-12">
            Featured Picks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={() => {
                  if (!user) {
                    openModal();
                  } else {
                    // User is logged in - can proceed (for now just show a message)
                    alert("Product details coming soon!");
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Info Strip */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm font-medium text-brown">Under 149 DKK options</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl mb-2">🚚</div>
            <p className="text-sm font-medium text-brown">Fast delivery in Denmark</p>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl mb-2">✨</div>
            <p className="text-sm font-medium text-brown">Nickel-safe & skin-friendly</p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
