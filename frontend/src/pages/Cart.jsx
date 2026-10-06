import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

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

export default function Cart() {
  const {
    cart,
    cartCount,
    cartTotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    formatLKR,
  } = useCart();

  const [confirmClear, setConfirmClear] = useState(false);

  // If cart is completely empty
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
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
            <li className="text-gray-900 font-semibold" aria-current="page">
              Cart
            </li>
          </ol>
        </nav>

        {/* Empty State Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 mb-6 shadow-inner">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your shopping cart is empty
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added any items to your cart yet. Explore our curated catalog of modern apparel to get started!
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Explore Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
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
          <li className="text-gray-900 font-semibold" aria-current="page">
            Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your selected variants and quantities before checkout.
          </p>
        </div>

        {/* Clear Cart Button */}
        <div>
          {confirmClear ? (
            <div className="inline-flex items-center space-x-2 p-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-medium text-rose-700 pl-2">
                Clear all items?
              </span>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setConfirmClear(false);
                }}
                className="px-2.5 py-1 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                Yes, clear
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors focus:outline-none"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-rose-600 hover:bg-rose-50 border border-gray-200 hover:border-rose-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Clear all items from shopping cart"
            >
              <Trash2 className="w-4 h-4 text-gray-500 group-hover:text-rose-600" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Cart Items (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* CART ITEMS LIST (Column 7 / 8) */}
        <div className="lg:col-span-8 space-y-4">
          <ul className="divide-y divide-gray-200/80 bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
            {cart.map((item) => {
              const itemTotal = Number(item.price) * Number(item.quantity);
              const isAtMaxStock = item.quantity >= item.availableStock;
              const isAtMinStock = item.quantity <= 1;
              const swatchBg = COLOUR_SWATCHES[item.colour] || '#9ca3af';

              return (
                <li
                  key={item.id}
                  className="p-4 sm:p-6 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center">
                    {/* Item Image */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="relative shrink-0 w-24 h-28 sm:w-28 sm:h-32 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200/80 group focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </Link>

                    {/* Item Information */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {item.category && (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 mb-1">
                              {item.category}
                            </span>
                          )}
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                            <Link
                              to={`/products/${item.productId}`}
                              className="hover:text-indigo-600 transition-colors"
                            >
                              {item.productName}
                            </Link>
                          </h2>
                        </div>

                        {/* Remove Button (Desktop / Mobile) */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove ${item.productName} (${item.size}, ${item.colour}) from cart`}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant Badges: Size & Colour */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-gray-600">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 font-medium">
                          Size: <strong className="ml-1 text-gray-900">{item.size}</strong>
                        </span>

                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gray-100 font-medium">
                          <span
                            className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                            style={{ background: swatchBg }}
                            aria-hidden="true"
                          />
                          <span>Colour:</span>
                          <strong className="text-gray-900">{item.colour}</strong>
                        </span>

                        <span className="text-xs text-gray-400 hidden sm:inline">•</span>

                        <span className="text-xs text-gray-500">
                          Unit: {formatLKR(item.price)}
                        </span>
                      </div>

                      {/* Controls Row: Quantity Selector + Line Subtotal */}
                      <div className="flex items-center justify-between pt-2 gap-4 flex-wrap">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div
                            className="inline-flex items-center rounded-xl border border-gray-300 bg-white shadow-xs p-0.5"
                            role="group"
                            aria-label={`Quantity controls for ${item.productName}`}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isAtMinStock}
                              aria-label={`Decrease quantity of ${item.productName}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <span
                              className="w-10 text-center text-xs sm:text-sm font-bold text-gray-900 select-none"
                              aria-live="polite"
                            >
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isAtMaxStock}
                              aria-label={`Increase quantity of ${item.productName}`}
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Stock Status Notice */}
                          {isAtMaxStock ? (
                            <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <AlertCircle className="w-3 h-3 mr-1 shrink-0" />
                              Max stock reached ({item.availableStock} max)
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400">
                              {item.availableStock} in stock
                            </span>
                          )}
                        </div>

                        {/* Item Subtotal */}
                        <div className="text-right">
                          <span className="text-xs text-gray-400 block sm:hidden">
                            Subtotal
                          </span>
                          <span className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                            {formatLKR(itemTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Continue Shopping Navigation link below list */}
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>

        {/* ORDER SUMMARY (Column 4 / 5) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm sticky top-24 space-y-6">
            <h2 className="text-lg font-extrabold text-gray-900 tracking-tight pb-4 border-b border-gray-100">
              Order Summary
            </h2>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
                <span className="font-semibold text-gray-900">{formatLKR(cartTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center space-x-1">
                  <span>Delivery</span>
                </div>
                <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-gray-100 pt-4 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-bold text-gray-900 block">Total</span>
                  <span className="text-xs text-gray-400">VAT inclusive</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-gray-900 tracking-tight">
                    {formatLKR(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="w-full py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-gray-500" />
                <span>Continue Shopping</span>
              </Link>
            </div>

            {/* Assurance / Trust badges */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Islandwide fast delivery across Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Secure payment gateway & verified checkout</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Easy 7-day exchange guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
