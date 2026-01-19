"use client";

import Link from "next/link";

const featuredProducts = [
  { id: 1, name: "Classic Hoops", price: 89, tag: "Best seller" },
  { id: 2, name: "Minimal Studs", price: 69, tag: "New" },
  { id: 3, name: "Dainty Drops", price: 99, tag: "Popular" },
  { id: 4, name: "Stack Rings", price: 79, tag: "Trending" },
];

export default function Hero() {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side - Text */}
        <div className="space-y-6 animate-in fade-in slide-in-from-left">
          <div className="inline-block px-4 py-1.5 bg-rose/20 text-brown rounded-full text-sm font-medium">
            New in Denmark · Budget-friendly earrings
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown leading-tight">
            Feel Lykke in Every Loop.
          </h1>
          <p className="text-lg text-brown/80 leading-relaxed max-w-lg">
            Discover affordable, trendy earrings designed for everyday wear. 
            Quality pieces that bring joy to your daily style, all under 149 DKK.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="#products"
              className="px-8 py-3 bg-rose text-white rounded-full hover:bg-rose/90 transition-all hover:scale-105 shadow-lg font-medium text-center"
            >
              Browse Earrings
            </Link>
            <Link
              href="/name-login"
              className="px-8 py-3 border-2 border-brown text-brown rounded-full hover:bg-brown hover:text-beige transition-all hover:scale-105 font-medium text-center"
            >
              Enter your name
            </Link>
          </div>
        </div>

        {/* Right Side - Product Cards */}
        <div className="relative">
          <div className="absolute inset-0 bg-rose/10 rounded-full blur-3xl -z-10"></div>
          <div className="grid grid-cols-2 gap-4 relative">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-brown/10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-square bg-beige rounded-xl mb-3 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-brown/30 rounded-full"></div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-brown text-sm">{product.name}</p>
                    <p className="text-brown/70 text-xs mt-1">{product.price} DKK</p>
                  </div>
                  <button className="text-rose hover:text-rose/80 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                {product.tag && (
                  <span className="inline-block mt-2 px-2 py-0.5 bg-rose/20 text-brown text-xs rounded-full">
                    {product.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



