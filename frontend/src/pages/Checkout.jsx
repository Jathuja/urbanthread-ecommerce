import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  Package,
  MapPin,
  Mail,
  Phone,
  User,
  FileText,
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

const PAYMENT_METHODS = [
  {
    id: 'whatsapp',
    title: 'WhatsApp Order',
    description: 'Instant confirmation & dedicated customer support via WhatsApp chat.',
    badge: 'Popular & Fast',
    icon: MessageSquare,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
  {
    id: 'payhere',
    title: 'PayHere Online Payment',
    description: 'Visa, MasterCard, eZ Cash, mCash, and online banking.',
    badge: 'Cards / Banking',
    icon: CreditCard,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    id: 'cash_on_delivery',
    title: 'Cash on Delivery',
    description: 'Pay cash in hand directly to courier upon delivery at your doorstep.',
    badge: 'Islandwide COD',
    icon: Banknote,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
  },
];

export default function Checkout() {
  const { cart, cartCount, cartTotal, clearCart, formatLKR } = useCart();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isInsufficientStock, setIsInsufficientStock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success state holding receipt snapshot
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Form input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field-specific validation error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }

    if (serverError) {
      setServerError(null);
    }
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone
    const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
    const digitsOnly = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim()) || digitsOnly.length < 9) {
      newErrors.phone = 'Please enter a valid phone number (e.g., 077 123 4567)';
    }

    // Address
    if (!formData.address.trim()) {
      newErrors.address = 'Street address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    // City
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.trim().length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Reset error state
    setServerError(null);
    setIsInsufficientStock(false);

    // Validate inputs
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.focus();
      }
      return;
    }

    // Cart check
    if (cart.length === 0) {
      setServerError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);

    // Prepare payload (Only send IDs & quantities, NEVER send client-calculated prices)
    const payload = {
      customer: {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        notes: formData.notes.trim() || undefined,
      },
      items: cart.map((item) => ({
        productId: Number(item.productId),
        variantId: Number(item.variantId),
        quantity: Number(item.quantity),
      })),
      paymentMethod,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/orders`, payload);

      if (response.data && response.data.success && response.data.data) {
        const orderData = response.data.data;

        // Snapshot of order receipt for confirmation view
        const receiptSnapshot = {
          orderId: orderData.orderId,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee || 0,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          orderStatus: orderData.orderStatus,
          customer: { ...formData },
          items: [...cart],
        };

        // Clear cart in context only AFTER confirmed backend success
        clearCart();

        // Switch to confirmation view
        setOrderSuccess(receiptSnapshot);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.data?.message || 'Unexpected response from server');
      }
    } catch (err) {
      console.error('Order submission failed:', err);

      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;

        if (status === 409) {
          setIsInsufficientStock(true);
          setServerError(
            data?.message ||
              'Some items are no longer available in the requested quantity. Please return to your cart and update the quantity.'
          );
        } else if (status === 400) {
          if (Array.isArray(data?.errors) && data.errors.length > 0) {
            setServerError(data.errors.join(' • '));
          } else {
            setServerError(data?.message || 'Please verify your details and try again.');
          }
        } else if (status === 404) {
          setServerError(
            data?.message ||
              'One or more selected products or variants could not be found. Please review your cart.'
          );
        } else {
          setServerError(
            'Unable to process your order at this time. Please try again or contact support.'
          );
        }
      } else {
        setServerError('Network error: Unable to reach the server. Please check your internet connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // SUCCESS CONFIRMATION VIEW
  // ==========================================
  if (orderSuccess) {
    const selectedMethodObj = PAYMENT_METHODS.find((p) => p.id === orderSuccess.paymentMethod);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-12 shadow-sm">
          {/* Header Badge & Title */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Order Placed Successfully</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto">
              Your order has been recorded in our system. A confirmation email has been dispatched to{' '}
              <span className="font-semibold text-gray-900">{orderSuccess.customer.email}</span>.
            </p>
          </div>

          {/* Key Order Highlight Card */}
          <div className="mt-8 bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="text-xs text-gray-500 font-medium block">Order Number</span>
              <span className="text-base sm:text-lg font-bold text-gray-900 mt-0.5 block">
                #{orderSuccess.orderId}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Total Amount</span>
              <span className="text-base sm:text-lg font-bold text-indigo-600 mt-0.5 block">
                {formatLKR(orderSuccess.total)}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Payment Method</span>
              <span className="text-sm sm:text-base font-semibold text-gray-900 mt-0.5 block">
                {selectedMethodObj?.title || orderSuccess.paymentMethod}
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium block">Order Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 mt-1 capitalize">
                {orderSuccess.orderStatus}
              </span>
            </div>
          </div>

          {/* Next Steps Notification */}
          <div className="mt-6 bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-indigo-900 space-y-1">
              <p className="font-semibold">Next Step: Payment Processing</p>
              <p className="text-indigo-700 leading-relaxed">
                {orderSuccess.paymentMethod === 'whatsapp' && (
                  <>
                    Our team will contact you on WhatsApp at{' '}
                    <span className="font-semibold">{orderSuccess.customer.phone}</span> with your order details and final confirmation before dispatch.
                  </>
                )}
                {orderSuccess.paymentMethod === 'payhere' && (
                  <>
                    PayHere payment gateway integration is currently in testing. An invoice link will be sent to your email to complete online payment.
                  </>
                )}
                {orderSuccess.paymentMethod === 'cash_on_delivery' && (
                  <>
                    Your package will be dispatched with our courier service. Please have the exact cash amount ready upon delivery.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Details Grid: Shipping & Items */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
            {/* Shipping Info */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>Delivery Address</span>
              </h2>
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 text-xs sm:text-sm text-gray-700 space-y-1">
                <p className="font-bold text-gray-900">{orderSuccess.customer.name}</p>
                <p>{orderSuccess.customer.address}</p>
                <p>{orderSuccess.customer.city}, Sri Lanka</p>
                <p className="text-gray-500 pt-1">Phone: {orderSuccess.customer.phone}</p>
                {orderSuccess.customer.notes && (
                  <p className="text-xs italic text-gray-500 pt-2 border-t border-gray-100">
                    Note: "{orderSuccess.customer.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Items Summary */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Items Ordered ({orderSuccess.items.length})</span>
              </h2>
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {orderSuccess.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-500">
                          {item.size} • {item.colour} • Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0 pl-2">
                      {formatLKR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // EMPTY CART STATE (WHEN USER VISITS /checkout DIRECTLY)
  // ==========================================
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
              <Link to="/cart" className="hover:text-indigo-600 transition-colors font-medium">
                Cart
              </Link>
            </li>
            <li className="text-gray-400">
              <ChevronRight className="w-3.5 h-3.5 inline" />
            </li>
            <li className="text-gray-900 font-semibold" aria-current="page">
              Checkout
            </li>
          </ol>
        </nav>

        {/* Empty State Card */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 mb-6 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md mx-auto leading-relaxed">
            You don't have any items in your shopping cart to checkout. Browse our collection and add your favorite apparel to proceed.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE CHECKOUT FORM & SUMMARY VIEW
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
        <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
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
          <li>
            <Link to="/cart" className="hover:text-indigo-600 transition-colors font-medium">
              Cart
            </Link>
          </li>
          <li className="text-gray-400">
            <ChevronRight className="w-3.5 h-3.5 inline" />
          </li>
          <li className="text-gray-900 font-semibold" aria-current="page">
            Checkout
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Express Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete your customer information and select your preferred payment option.
        </p>
      </div>

      {/* Global Server / Stock Error Banner */}
      {serverError && (
        <div
          role="alert"
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-red-50 border border-red-200 flex items-start space-x-3.5 text-red-800"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-red-900">Unable to complete checkout</p>
            <p className="mt-1 leading-relaxed">{serverError}</p>
            {isInsufficientStock && (
              <div className="mt-3">
                <Link
                  to="/cart"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Cart & Adjust Quantity</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Two-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Customer Form & Payment Method (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmit} noValidate>
            {/* Card 1: Customer Details */}
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Customer & Delivery Information</h2>
                  <p className="text-xs text-gray-500">All fields marked with an asterisk are required</p>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {/* Full Name */}
                <div>
                  <label htmlFor="customer-name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="customer-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Kasun Perera"
                      aria-required="true"
                      aria-invalid={errors.name ? 'true' : 'false'}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.name
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Email & Phone (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label htmlFor="customer-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="customer-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="kasun@example.com"
                        aria-required="true"
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="customer-phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="customer-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="077 123 4567"
                        aria-required="true"
                        aria-invalid={errors.phone ? 'true' : 'false'}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                            : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p id="phone-error" className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label htmlFor="customer-address" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    Shipping Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      id="customer-address"
                      name="address"
                      type="text"
                      autoComplete="street-address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="No 45, Galle Road, Bambalapitiya"
                      aria-required="true"
                      aria-invalid={errors.address ? 'true' : 'false'}
                      aria-describedby={errors.address ? 'address-error' : undefined}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.address
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                          : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900'
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p id="address-error" className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                      <span>{errors.address}</span>
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label htmlFor="customer-city" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
                    City / Town <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customer-city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Colombo, Kandy, Galle"
                    aria-required="true"
                    aria-invalid={errors.city ? 'true' : 'false'}
                    aria-describedby={errors.city ? 'city-error' : undefined}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                      errors.city
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-200 text-red-900'
                        : 'border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-indigo-100 text-gray-900'
                    }`}
                  />
                  {errors.city && (
                    <p id="city-error" className="mt-1.5 text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                      <span>{errors.city}</span>
                    </p>
                  )}
                </div>

                {/* Order Notes (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="customer-notes" className="block text-xs sm:text-sm font-semibold text-gray-700">
                      Order Notes
                    </label>
                    <span className="text-xs text-gray-400">Optional</span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="customer-notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special delivery instructions, building floor, or landmark..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm text-gray-900 transition-all focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="mt-8 bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center space-x-3 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Select Payment Method</h2>
                  <p className="text-xs text-gray-500">Choose how you would like to pay for your order</p>
                </div>
              </div>

              {/* Informational banner about payment processing */}
              <div className="mt-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-amber-900 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold">Notice:</span> Payment processing will happen in the next step.
                  Placing an order now reserves your stock without instant debit.
                </p>
              </div>

              {/* Radio Group / Selectable Cards */}
              <fieldset className="mt-6 space-y-3.5">
                <legend className="sr-only">Choose a payment method</legend>
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      htmlFor={`payment-${method.id}`}
                      className={`relative flex items-start p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/30 shadow-sm'
                          : 'border-gray-200/80 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`payment-${method.id}`}
                        name="paymentMethod"
                        value={method.id}
                        checked={isSelected}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                      />
                      <div className="ml-3.5 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${method.iconBg}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="text-sm sm:text-base font-bold text-gray-900 block">
                              {method.title}
                            </span>
                            <span className="text-xs text-gray-500 block mt-0.5 leading-relaxed">
                              {method.description}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`self-start sm:self-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${method.badgeColor}`}
                        >
                          {method.badge}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </fieldset>
            </div>

            {/* Desktop Action & Mobile Action Placeholder */}
            <div className="mt-8 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-base flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:shadow-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-indigo-200" />
                    <span>Place Order • {formatLKR(cartTotal)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-gray-500 px-2">
                <Link
                  to="/cart"
                  className="inline-flex items-center space-x-1.5 hover:text-indigo-600 transition-colors font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Cart</span>
                </Link>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>256-bit encrypted checkout</span>
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-7 shadow-sm lg:sticky lg:top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <span>Order Summary</span>
              </h2>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="py-3.5 first:pt-0 last:pb-0 flex space-x-3.5">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    <img
                      src={item.image}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-gray-900/80 text-white text-[10px] font-bold">
                      x{item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                        {item.productName}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span className="px-1.5 py-0.5 rounded bg-gray-100 font-medium text-gray-700">
                          {item.size}
                        </span>
                        <span className="flex items-center space-x-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-gray-300 inline-block shrink-0"
                            style={{
                              background: COLOUR_SWATCHES[item.colour] || '#cbd5e1',
                            }}
                          />
                          <span>{item.colour}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-dashed border-gray-100 text-xs">
                      <span className="text-gray-400">
                        {formatLKR(item.price)} each
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatLKR(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-3 pt-4 border-t border-gray-100 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatLKR(cartTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center space-x-1.5">
                  <span>Delivery</span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Free Promo
                  </span>
                </div>
                <span className="font-semibold text-emerald-600">LKR 0.00</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-baseline justify-between">
                <div>
                  <span className="text-base font-bold text-gray-900 block">Total Due</span>
                  <span className="text-[11px] text-gray-400">All taxes included</span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
                    {formatLKR(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust Assurances */}
            <div className="pt-4 border-t border-gray-100 space-y-2.5 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Islandwide doorstep delivery across Sri Lanka</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Official UrbanThread quality guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>7-day easy size exchange support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
