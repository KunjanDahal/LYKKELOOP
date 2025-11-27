"use client";

import Link from "next/link";
import { Category } from "@/types";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={category.slug}
      className="bg-beige rounded-2xl p-8 border-2 border-brown/20 hover:border-rose transition-all hover:shadow-xl hover:scale-105 cursor-pointer group"
    >
      <div className="text-6xl mb-6 text-center group-hover:scale-110 transition-transform">
        {category.icon || "○"}
      </div>
      <h3 className="text-2xl font-semibold text-brown mb-3 text-center">
        {category.name}
      </h3>
      <p className="text-brown/70 text-center mb-6 min-h-[3rem]">
        {category.description}
      </p>
      <div className="text-center">
        <span className="inline-block px-6 py-2.5 bg-rose text-white rounded-full hover:bg-rose/90 transition-colors font-medium">
          View all →
        </span>
      </div>
    </Link>
  );
}


