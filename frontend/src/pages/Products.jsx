import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/products`);
        if (isMounted && res.data && res.data.success) {
          setProducts(res.data.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Products Catalog
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Explore our latest clothing and fashion collection
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm font-medium text-gray-500">
          Showing {products.length} products
        </div>
      </div>

      {loading && (
        <div className="py-20 text-center text-gray-500">
          <p className="text-lg">Loading products from UrbanThread API...</p>
        </div>
      )}

      {error && !loading && (
        <div className="my-8 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
          <p className="font-semibold">Unable to load products</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          <p className="text-lg">No products found.</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="aspect-w-1 aspect-h-1 w-full h-64 overflow-hidden bg-gray-100">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider mb-1">
                    <span>{product.category?.name}</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">
                    LKR {product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-indigo-600 font-medium">
                    {product.variants?.length} variant{product.variants?.length === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
