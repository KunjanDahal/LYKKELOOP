"use client";

import { useState } from "react";
import Image from "next/image";
import { Product, DbProduct } from "@/types";

interface ProductCardProps {
  product: Product | DbProduct;
  onProductClick: () => void;
}

export default function ProductCard({ product, onProductClick }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Check if it's a database product or legacy product
  const isDbProduct = "_id" in product;
  const productId = isDbProduct ? product._id : product.id.toString();
  const productName = product.name;
  const productPrice = isDbProduct ? product.priceDkk : product.price;
  const productImage = isDbProduct ? product.imageUrl : product.image;
  const productTag = "tag" in product ? product.tag : undefined;

  return (
    <div
      onClick={onProductClick}
      className="bg-white rounded-2xl p-6 border border-brown/10 hover:shadow-xl transition-all hover:scale-105 cursor-pointer group"
    >
      <div className="aspect-square bg-beige rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
        {productImage && !imageError ? (
          <Image
            src={productImage}
            alt={productName}
            fill
            className="object-cover group-hover:scale-110 transition-transform"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 border-2 border-brown/30 rounded-full group-hover:scale-110 transition-transform"></div>
        )}
      </div>
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-brown flex-1">{productName}</h3>
        {productTag && (
          <span className="px-2 py-0.5 bg-rose/20 text-brown text-xs rounded-full ml-2 whitespace-nowrap">
            {productTag}
          </span>
        )}
      </div>
      <p className="text-lg font-bold text-brown mb-4">{productPrice} DKK</p>
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
  );
}



