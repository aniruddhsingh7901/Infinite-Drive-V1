'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ProductProps {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string;
  featured?: boolean;
  onAddToCart?: (id: string) => void;
}

export default function ProductCard({
  id,
  title,
  description,
  price,
  imageUrl,
  category = 'Book',
  featured = false,
  onAddToCart
}: ProductProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(id);
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 flex flex-col h-full ${
        isHovered ? 'shadow-lg transform -translate-y-1' : ''
      } ${featured ? 'border-2 border-blue-500' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`} className="flex flex-col h-full">
        <div className="relative h-48 w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          {featured && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
          {category && (
            <div className="absolute top-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              {category}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Product Grid Component for displaying multiple products
export function ProductGrid({ products }: { products: ProductProps[] }) {
  const handleAddToCart = (id: string) => {
    console.log(`Added product ${id} to cart`);
    // In a real application, you would implement cart functionality here
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}

// Featured Product Component for highlighting a specific product
export function FeaturedProduct({ product }: { product: ProductProps }) {
  const handleAddToCart = (id: string) => {
    console.log(`Added featured product ${id} to cart`);
    // In a real application, you would implement cart functionality here
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
      <div className="md:flex">
        <div className="md:flex-shrink-0 relative h-64 md:h-auto md:w-1/3">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-blue-500 text-white font-bold px-3 py-1 rounded-full">
            Featured
          </div>
        </div>
        <div className="p-8 md:w-2/3">
          <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
            {product.category}
          </div>
          <h2 className="mt-2 text-2xl font-bold text-gray-900">{product.title}</h2>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <div className="mt-6 flex items-center justify-between">
            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            <button
              onClick={() => handleAddToCart(product.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Product Detail Component for a full product page
export function ProductDetail({ product }: { product: ProductProps & { fullDescription?: string, specifications?: Record<string, string> } }) {
  const [quantity, setQuantity] = useState(1);
  
  const handleAddToCart = () => {
    console.log(`Added ${quantity} of product ${product.id} to cart`);
    // In a real application, you would implement cart functionality here
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="md:flex">
        <div className="md:flex-shrink-0 relative h-96 md:h-auto md:w-1/2">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.title}
              fill
              className="object-contain"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
        </div>
        <div className="p-8 md:w-1/2">
          <div className="uppercase tracking-wide text-sm text-blue-600 font-semibold">
            {product.category}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.title}</h1>
          <p className="mt-4 text-gray-600">{product.fullDescription || product.description}</p>
          
          {product.specifications && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex py-2 border-b border-gray-200 last:border-0">
                    <span className="font-medium text-gray-700 w-1/3">{key}</span>
                    <span className="text-gray-600 w-2/3">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <div className="flex items-center">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-lg"
                >
                  -
                </button>
                <span className="bg-gray-100 px-4 py-1">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-lg"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
