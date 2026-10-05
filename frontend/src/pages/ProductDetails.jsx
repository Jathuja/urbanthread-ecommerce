import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Minus,
  Plus,
  Layers,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Variant selection states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColour, setSelectedColour] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadProduct() {
      setLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const res = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        if (isMounted) {
          if (res.data && res.data.success && res.data.data) {
            const prod = res.data.data;
            setProduct(prod);

            // Initialize variant selection
            const variants = prod.variants || [];
            if (variants.length > 0) {
              const initial = variants.find((v) => v.stock > 0) || variants[0];
              setSelectedSize(initial.size);
              setSelectedColour(initial.colour);
            }
            setQuantity(1);
          } else {
            setNotFound(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError('Unable to load product. Please try again.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [id, reloadKey]);

  // Extract distinct sizes & colours from real variants
  const variants = useMemo(() => product?.variants || [], [product]);

  const availableSizes = useMemo(() => {
    return [...new Set(variants.map((v) => v.size))];
  }, [variants]);

  const availableColours = useMemo(() => {
    return [...new Set(variants.map((v) => v.colour))];
  }, [variants]);

  // Find the exact matching variant
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) => v.size === selectedSize && v.colour === selectedColour
    ) || null;
  }, [variants, selectedSize, selectedColour]);

  const variantStock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = !selectedVariant || variantStock <= 0;

  // Handle colour change: if current size is not valid for this colour, pick a valid size
  const handleColourChange = (colour) => {
    setSelectedColour(colour);
    const validWithSize = variants.some(
      (v) => v.colour === colour && v.size === selectedSize
    );
    if (!validWithSize) {
      // Find first variant for this colour (prefer in-stock)
      const fallback =
        variants.find((v) => v.colour === colour && v.stock > 0) ||
        variants.find((v) => v.colour === colour);
      if (fallback) {
        setSelectedSize(fallback.size);
      }
    }
    setQuantity(1);
    setAddedNotice(false);
  };

  // Handle size change: if current colour is not valid for this size, pick a valid colour
  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const validWithColour = variants.some(
      (v) => v.size === size && v.colour === selectedColour
    );
    if (!validWithColour) {
      // Find first variant for this size (prefer in-stock)
      const fallback =
        variants.find((v) => v.size === size && v.stock > 0) ||
        variants.find((v) => v.size === size);
      if (fallback) {
        setSelectedColour(fallback.colour);
      }
    }
    setQuantity(1);
    setAddedNotice(false);
  };

  // Quantity controls
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseQuantity = () => {
    if (variantStock > 0 && quantity < variantStock) {
      setQuantity((prev) => Math.min(variantStock, prev + 1));
    }
  };

  // Add to Cart UI preparation handler
  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 3000);
  };

  // ===================== LOADING STATE =====================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-48 mb-8 animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Image Skeleton */}
          <div className="aspect-[4/5] bg-gray-200 rounded-2xl animate-pulse" />

          {/* Info Skeleton */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-7 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-20 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-9 w-12 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>

            <div className="h-12 bg-gray-200 rounded-xl w-full animate-pulse pt-4" />
          </div>
        </div>
      </div>
    );
  }

  // ===================== PRODUCT NOT FOUND (404) =====================
  if (notFound) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600 mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product not found</h1>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            The product you are looking for doesn't exist or may have been removed from our catalog.
          </p>
          <div className="mt-6">
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2 w-full px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===================== API ERROR STATE =====================
  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-200/80 p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 mb-5">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Unable to load product</h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            {error || 'Unable to load product. Please try again.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Retry
            </button>
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===================== SUCCESS PRODUCT VIEW =====================
  const formattedPrice = Number(product.price).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* 9. BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500 flex-wrap">
          <li>
            <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
          </li>
          <li className="text-gray-400">
            <ChevronRight className="w-3.5 h-3.5 inline" />
          </li>
          <li>
            <Link to="/products" className="hover:text-indigo-600 transition-colors font-medium">
              Shop
            </Link>
          </li>
          <li className="text-gray-400">
            <ChevronRight className="w-3.5 h-3.5 inline" />
          </li>
          <li
            className="text-gray-900 font-semibold truncate max-w-[200px] sm:max-w-md"
            aria-current="page"
          >
            {product.name}
          </li>
        </ol>
      </nav>

      {/* TWO-COLUMN LAYOUT: Desktop 2 cols, Mobile 1 col */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* 10. PRODUCT IMAGE SECTION (LEFT) */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full bg-gray-100 rounded-3xl overflow-hidden border border-gray-200/80 shadow-sm group">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Category Tag Overlay */}
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-md text-gray-800 shadow-sm">
                {product.category?.name || 'Apparel'}
              </span>
            </div>

            {/* Stock Tag Overlay */}
            <div className="absolute top-4 right-4">
              {isOutOfStock ? (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50/95 backdrop-blur-md text-rose-700 border border-rose-200 shadow-sm">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Out of Stock</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50/95 backdrop-blur-md text-emerald-700 border border-emerald-200 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>In Stock ({variantStock} available)</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick Assurance Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-200/70 text-xs text-gray-600">
              <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Islandwide Delivery</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-200/70 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-gray-200/70 text-xs text-gray-600">
              <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Easy Exchange</span>
            </div>
          </div>
        </div>

        {/* PRODUCT DETAILS & SELECTION (RIGHT) */}
        <div className="flex flex-col space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {product.category?.name}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  {variants.length} Available {variants.length === 1 ? 'Variant' : 'Variants'}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
              {product.name}
            </h1>

            {/* Price in LKR */}
            <div className="mt-4 flex items-baseline space-x-3">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                LKR {formattedPrice}
              </span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                VAT Inclusive
              </span>
            </div>

            {/* Total Available Stock */}
            <div className="mt-3 inline-flex items-center space-x-2 text-xs text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg">
              <span className="font-semibold text-gray-800">Total Catalog Stock:</span>
              <span className="font-bold text-indigo-600">{product.stock} units</span>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-b border-gray-100 py-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 3. VARIANT SELECTION: COLOUR */}
          {availableColours.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label id="colour-label" className="text-sm font-semibold text-gray-900">
                  Colour:{' '}
                  <span className="font-normal text-indigo-600 ml-1">
                    {selectedColour}
                  </span>
                </label>
                <span className="text-xs text-gray-500">
                  {availableColours.length} {availableColours.length === 1 ? 'color' : 'colors'}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="colour-label"
                className="flex flex-wrap gap-2.5"
              >
                {availableColours.map((colour) => {
                  const isSelected = selectedColour === colour;
                  const swatchBg = COLOUR_SWATCHES[colour] || '#9ca3af';

                  return (
                    <button
                      key={colour}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleColourChange(colour)}
                      className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-600'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-inner"
                        style={{ background: swatchBg }}
                        aria-hidden="true"
                      />
                      <span>{colour}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. VARIANT SELECTION: SIZE */}
          {availableSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label id="size-label" className="text-sm font-semibold text-gray-900">
                  Size:{' '}
                  <span className="font-normal text-indigo-600 ml-1">
                    {selectedSize}
                  </span>
                </label>
                <span className="text-xs text-gray-500">
                  {availableSizes.length} {availableSizes.length === 1 ? 'size' : 'sizes'}
                </span>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="size-label"
                className="flex flex-wrap gap-2.5"
              >
                {availableSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  // Check if this size is available with the currently selected colour
                  const variantForCombo = variants.find(
                    (v) => v.size === size && v.colour === selectedColour
                  );
                  const isComboStocked = variantForCombo && variantForCombo.stock > 0;

                  return (
                    <button
                      key={size}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSizeChange(size)}
                      className={`min-w-12 px-3.5 py-2 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-600'
                          : isComboStocked
                          ? 'border-gray-200 bg-white text-gray-800 hover:border-indigo-400 hover:text-indigo-600'
                          : 'border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400'
                      }`}
                      title={
                        !variantForCombo
                          ? `Switch to ${size} (adjusts colour)`
                          : !isComboStocked
                          ? `${size} is out of stock in ${selectedColour}`
                          : `${size} (${variantForCombo.stock} in stock)`
                      }
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4 & 5. STOCK STATUS FOR SELECTED VARIANT */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">Selected Variant:</span>
              <span className="font-semibold text-gray-900">
                {selectedSize} / {selectedColour}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
              <span className="text-gray-600 font-medium">Variant Stock:</span>
              {isOutOfStock ? (
                <span className="font-bold text-rose-600 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Out of stock</span>
                </span>
              ) : (
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {variantStock} {variantStock === 1 ? 'unit available' : 'units available'}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* 4. QUANTITY SELECTOR & ADD TO CART */}
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="quantity-selector" className="text-sm font-semibold text-gray-900 block mb-2">
                Quantity
              </label>

              <div className="flex items-center space-x-4">
                {/* [-] quantity [+] Controls */}
                <div
                  id="quantity-selector"
                  className="inline-flex items-center rounded-xl border border-gray-300 bg-white shadow-xs p-1"
                >
                  <button
                    type="button"
                    onClick={handleDecreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span
                    className="w-12 text-center text-sm font-bold text-gray-900 select-none"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={handleIncreaseQuantity}
                    disabled={quantity >= variantStock || isOutOfStock}
                    aria-label="Increase quantity"
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-gray-500">
                  {isOutOfStock
                    ? 'Variant currently unavailable'
                    : quantity >= variantStock
                    ? 'Maximum available quantity selected'
                    : `Max available: ${variantStock}`}
                </span>
              </div>
            </div>

            {/* ADD TO CART BUTTON (UI / PREPARATION ELEMENT) */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer active:scale-[0.99] shadow-indigo-200'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>

            {/* Temporary UI Notice when clicked */}
            {addedNotice && (
              <div
                role="status"
                className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs sm:text-sm flex items-center space-x-2.5 animate-fadeIn"
              >
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>{product.name}</strong> ({selectedSize} / {selectedColour}) × {quantity} selected! Ready for cart integration.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
