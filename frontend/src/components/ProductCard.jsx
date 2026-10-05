import { Link } from 'react-router-dom';
import { Layers, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProductCard({ product }) {
  const variantCount = product.variants?.length || 0;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800 shadow-sm">
            {product.category?.name || 'Apparel'}
          </span>
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
              <AlertCircle className="w-3 h-3" />
              <span>Out of Stock</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="w-3 h-3" />
              <span>In Stock ({product.stock})</span>
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Variant Metadata */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 block">Price</span>
            <span className="text-lg font-bold text-gray-900">
              LKR {Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-medium bg-indigo-50/80 px-2.5 py-1 rounded-lg">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {variantCount} {variantCount === 1 ? 'Variant' : 'Variants'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
