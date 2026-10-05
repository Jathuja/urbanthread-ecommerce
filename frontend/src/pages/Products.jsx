import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import {
  Search,
  SlidersHorizontal,
  X,
  RefreshCcw,
  PackageSearch,
  ChevronDown,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const CATEGORIES = ['Men', 'Women', 'Accessories'];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', 'One Size'];

const COLOURS = [
  'Black', 'White', 'Grey', 'Navy', 'Blue', 'Light Blue',
  'Olive', 'Beige', 'Brown', 'Tan', 'Charcoal',
  'Floral', 'Yellow',
];

const COLOUR_SWATCHES = {
  Black: '#111111',
  White: '#f5f5f5',
  Grey: '#9ca3af',
  Navy: '#1e3a5f',
  Blue: '#3b82f6',
  'Light Blue': '#93c5fd',
  Olive: '#6b7c47',
  Beige: '#d2b48c',
  Brown: '#92400e',
  Tan: '#c4995a',
  Charcoal: '#374151',
  Floral: 'linear-gradient(135deg,#f9a8d4,#86efac,#fde68a)',
  Yellow: '#fbbf24',
};

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  size: '',
  colour: '',
  minPrice: '',
  maxPrice: '',
};

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ─── Loading skeleton ─── */
function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="pt-3 flex justify-between items-center border-t border-gray-100">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-5 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

/* ─── Filter Panel (shared by sidebar + mobile drawer) ─── */
function FilterPanel({ filters, onChange, onClear, hasActiveFilters }) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="filter-search" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            id="filter-search"
            type="search"
            value={filters.search}
            onChange={(e) => onChange('search', e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          />
          {filters.search && (
            <button
              onClick={() => onChange('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="filter-category" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Category
        </label>
        <div className="relative">
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition cursor-pointer"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => onChange('size', filters.size === s ? '' : s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                filters.size === s
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400 hover:text-indigo-600'
              }`}
              aria-pressed={filters.size === s}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colour */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Colour
        </label>
        <div className="flex flex-wrap gap-2.5">
          {COLOURS.map((col) => {
            const swatch = COLOUR_SWATCHES[col] || '#e5e7eb';
            const isGradient = swatch.startsWith('linear');
            const isSelected = filters.colour === col;
            return (
              <button
                key={col}
                onClick={() => onChange('colour', isSelected ? '' : col)}
                title={col}
                aria-label={`Filter by colour ${col}${isSelected ? ' (selected)' : ''}`}
                aria-pressed={isSelected}
                className={`w-7 h-7 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1 ${
                  isSelected
                    ? 'border-indigo-600 scale-110 shadow-md'
                    : col === 'White'
                    ? 'border-gray-300 hover:border-gray-500'
                    : 'border-transparent hover:border-gray-400'
                }`}
                style={{ background: isGradient ? swatch : swatch }}
              />
            );
          })}
        </div>
        {filters.colour && (
          <p className="mt-2 text-xs text-indigo-600 font-medium">
            {filters.colour}{' '}
            <button
              onClick={() => onChange('colour', '')}
              className="underline hover:no-underline ml-1"
            >
              clear
            </button>
          </p>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
          Price Range (LKR)
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor="filter-min-price" className="sr-only">Minimum price</label>
            <input
              id="filter-min-price"
              type="number"
              min="0"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange('minPrice', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
          <span className="text-gray-400 text-sm">–</span>
          <div className="flex-1">
            <label htmlFor="filter-max-price" className="sr-only">Maximum price</label>
            <input
              id="filter-max-price"
              type="number"
              min="0"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange('maxPrice', e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );
}

/* ─── Main Products Page ─── */
export default function Products() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Debounce text inputs so API is not called on every keystroke
  const debouncedSearch = useDebounce(filters.search, 400);
  const debouncedMinPrice = useDebounce(filters.minPrice, 500);
  const debouncedMaxPrice = useDebounce(filters.maxPrice, 500);

  const controllerRef = useRef(null);

  const hasActiveFilters =
    filters.search || filters.category || filters.size ||
    filters.colour || filters.minPrice || filters.maxPrice;

  const handleChange = useCallback((field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleClear = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setMobileFiltersOpen(false);
  }, []);

  /* Fetch products whenever any debounced filter value changes */
  useEffect(() => {
    // Cancel previous in-flight request
    if (controllerRef.current) controllerRef.current.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (debouncedSearch)   params.search   = debouncedSearch;
        if (filters.category)  params.category  = filters.category;
        if (filters.size)      params.size      = filters.size;
        if (filters.colour)    params.colour    = filters.colour;
        if (debouncedMinPrice) params.minPrice  = debouncedMinPrice;
        if (debouncedMaxPrice) params.maxPrice  = debouncedMaxPrice;

        const res = await axios.get(`${API_BASE_URL}/api/products`, {
          params,
          signal: controller.signal,
        });

        if (res.data && res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') return;
        setError(
          err.response?.data?.message ||
          err.message ||
          'Unable to load products. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [
    debouncedSearch,
    filters.category,
    filters.size,
    filters.colour,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  /* ── Active filter pills ── */
  const activePills = [
    filters.search   && { label: `"${filters.search}"`,  field: 'search' },
    filters.category && { label: filters.category,        field: 'category' },
    filters.size     && { label: `Size: ${filters.size}`, field: 'size' },
    filters.colour   && { label: filters.colour,          field: 'colour' },
    filters.minPrice && { label: `Min: LKR ${filters.minPrice}`, field: 'minPrice' },
    filters.maxPrice && { label: `Max: LKR ${filters.maxPrice}`, field: 'maxPrice' },
  ].filter(Boolean);

  return (
    <div className="bg-gray-50/40 min-h-screen">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                Shop the Collection
              </h1>
              <p className="mt-1.5 text-base text-gray-500">
                Explore our latest clothing and fashion essentials.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                {loading
                  ? 'Loading…'
                  : `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`}
              </span>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Open filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 ml-0.5" />
                )}
              </button>
            </div>
          </div>

          {/* Active filter pills */}
          {activePills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activePills.map(({ label, field }) => (
                <span
                  key={field}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {label}
                  <button
                    onClick={() => handleChange(field, '')}
                    className="rounded-full hover:bg-indigo-200 p-0.5 transition"
                    aria-label={`Remove ${label} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body: Sidebar + Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8 items-start">

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  Filters
                </h2>
                {hasActiveFilters && (
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </div>
              <FilterPanel
                filters={filters}
                onChange={handleChange}
                onClear={handleClear}
                hasActiveFilters={!!hasActiveFilters}
              />
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <main className="flex-1 min-w-0">
            {/* Loading Skeletons */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mb-5">
                  <RefreshCcw className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Unable to load products
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  {error}
                </p>
                <button
                  onClick={() => {
                    setFilters(DEFAULT_FILTERS);
                    // Trigger re-fetch by resetting filter state (effect dependency changes)
                    setError(null);
                    setLoading(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-5">
                  <PackageSearch className="w-7 h-7 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-sm text-gray-500 max-w-xs mb-6">
                  Try adjusting your filters or search term to find what you're looking for.
                </p>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                Filter Products
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel
                filters={filters}
                onChange={handleChange}
                onClear={handleClear}
                hasActiveFilters={!!hasActiveFilters}
              />
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 px-5 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                View {loading ? '…' : `${products.length} Product${products.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
