"use client";

const categories = [
  {
    id: 1,
    name: "Everyday hoops",
    description: "Classic styles for daily wear",
    icon: "○",
  },
  {
    id: 2,
    name: "Party sparkle",
    description: "Make a statement",
    icon: "✦",
  },
  {
    id: 3,
    name: "Minimal studs",
    description: "Subtle elegance",
    icon: "•",
  },
  {
    id: 4,
    name: "Gift sets",
    description: "Perfect for gifting",
    icon: "🎁",
  },
];

export default function Categories() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-bold text-brown text-center mb-12">
        Find Your New Favorite Pair
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-beige rounded-2xl p-6 border-2 border-brown/20 hover:border-rose transition-all hover:shadow-lg hover:scale-105 cursor-pointer"
          >
            <div className="text-4xl mb-4 text-center">{category.icon}</div>
            <h3 className="text-xl font-semibold text-brown mb-2 text-center">
              {category.name}
            </h3>
            <p className="text-brown/70 text-sm text-center mb-4">
              {category.description}
            </p>
            <button className="w-full py-2 text-rose font-medium hover:underline">
              Shop category →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}



