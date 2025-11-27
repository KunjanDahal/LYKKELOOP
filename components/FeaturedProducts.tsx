"use client";

interface Product {
  id: number;
  name: string;
  price: number;
  tag?: string;
}

const products: Product[] = [
  { id: 1, name: "Classic Gold Hoops", price: 89, tag: "Best seller" },
  { id: 2, name: "Pearl Drop Earrings", price: 129, tag: "New" },
  { id: 3, name: "Minimalist Studs", price: 69, tag: "Popular" },
  { id: 4, name: "Geometric Hoops", price: 99, tag: "Trending" },
  { id: 5, name: "Dainty Chain Drops", price: 109, tag: "Best seller" },
  { id: 6, name: "Stacked Ring Set", price: 149, tag: "New" },
];

interface FeaturedProductsProps {
  onProductClick: () => void;
}

export default function FeaturedProducts({ onProductClick }: FeaturedProductsProps) {
  return (
    <section id="products" className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-brown text-center mb-12">
        Featured Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={onProductClick}
            className="bg-white rounded-2xl p-6 border border-brown/10 hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
          >
            <div className="aspect-square bg-beige rounded-xl mb-4 flex items-center justify-center overflow-hidden">
              <div className="w-24 h-24 border-2 border-brown/30 rounded-full group-hover:scale-110 transition-transform"></div>
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-brown">{product.name}</h3>
              {product.tag && (
                <span className="px-2 py-0.5 bg-rose/20 text-brown text-xs rounded-full">
                  {product.tag}
                </span>
              )}
            </div>
            <p className="text-lg font-bold text-brown mb-4">{product.price} DKK</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProductClick();
              }}
              className="w-full py-2.5 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium"
            >
              View details
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}



