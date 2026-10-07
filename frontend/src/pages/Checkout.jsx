import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';
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
  ExternalLink,
  Copy,
  Check,
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
    isPrimary: true,
  },
  {
    id: 'payhere',
    title: 'PayHere Online Payment',
    description: 'Visa, MasterCard, eZ Cash, mCash, and online banking.',
    badge: 'Cards / Banking',
    icon: CreditCard,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    isPrimary: true,
  },
  {
    id: 'cash_on_delivery',
    title: 'Cash on Delivery',
    description: 'Pay cash in hand directly to courier upon delivery at your doorstep.',
    badge: 'Islandwide COD',
    icon: Banknote,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    isPrimary: false,
  },
];

export default function Checkout() {
  const { cart, cartCount, cartTotal, clearCart, validateAndSyncCart, formatLKR } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Read URL query params if returning from PayHere checkout redirect
  const payhereQueryStatus = searchParams.get('payhere_status');
  const payhereQueryOrderId = searchParams.get('order_id');

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    notes: '',
  });

  // Prefill form if user loads after mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState('whatsapp');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [isInsufficientStock, setIsInsufficientStock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartSyncNotice, setCartSyncNotice] = useState(null);

  // Validate cart against server on mount to detect stale/deleted items
  useEffect(() => {
    let isMounted = true;
    if (cart.length > 0) {
      validateAndSyncCart().then((res) => {
        if (isMounted && res && res.hasChanges) {
          setCartSyncNotice({
            message:
              'One or more items in your cart were no longer available or had updated inventory. Your cart has been refreshed.',
            issues: res.issues,
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Success state holding receipt snapshot
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showWhatsAppPreview, setShowWhatsAppPreview] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // PayHere return callback state
  const [payhereReturnNotice] = useState(() => {
    if (payhereQueryStatus && payhereQueryOrderId) {
      return { status: payhereQueryStatus, orderId: payhereQueryOrderId };
    }
    return null;
  });

  // Handle return from PayHere sandbox (success or cancelled)
  useEffect(() => {
    if (payhereQueryOrderId && !orderSuccess) {
      axios
        .get(`${API_BASE_URL}/api/orders/${payhereQueryOrderId}`)
        .then(async (res) => {
          if (res.data?.success && res.data.data) {
            const fetched = res.data.data;

            // Also load PayHere checkout params for the existing order in case of retry
            let payhereData = null;
            try {
              const pRes = await axios.get(
                `${API_BASE_URL}/api/orders/${payhereQueryOrderId}/payhere-params`
              );
              if (pRes.data?.success) {
                payhereData = pRes.data.data;
              }
            } catch {
              // PayHere params fetch error ignored
            }

            setOrderSuccess({
              orderId: fetched.id,
              subtotal: fetched.subtotal,
              deliveryFee: fetched.deliveryFee || 0,
              total: fetched.total,
              paymentMethod: fetched.paymentMethod,
              paymentStatus: fetched.paymentStatus,
              orderStatus: fetched.orderStatus,
              customer: fetched.customer,
              items: fetched.items,
              payhere: payhereData,
            });
          }
        })
        .catch((err) => {
          console.warn('Could not retrieve PayHere returned order:', err.message);
        });
    }
  }, [payhereQueryOrderId, orderSuccess]);

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

    // Verify cart items against backend product and variant catalog before creating order
    try {
      const syncCheck = await validateAndSyncCart();
      if (!syncCheck.valid || syncCheck.hasChanges) {
        setIsSubmitting(false);
        setServerError(
          'One or more items in your cart were no longer available or had updated inventory. Your cart has been refreshed. Please review your order before placing it.'
        );
        return;
      }
    } catch {
      // Proceed if validation network error
    }

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

        // Snapshot of order receipt for confirmation view using server-calculated prices
        const receiptSnapshot = {
          orderId: orderData.orderId,
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee || 0,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
          paymentStatus: orderData.paymentStatus,
          orderStatus: orderData.orderStatus,
          customer: orderData.customer || { ...formData },
          payhere: orderData.payhere || null,
          // Authoritative items from backend response
          items:
            orderData.items && orderData.items.length > 0
              ? orderData.items.map((srvItem) => {
                  const cartMatch = cart.find(
                    (c) =>
                      Number(c.productId) === Number(srvItem.productId) &&
                      Number(c.variantId) === Number(srvItem.variantId)
                  );
                  return {
                    ...srvItem,
                    image: cartMatch?.image || '',
                  };
                })
              : cart.map((c) => ({
                  productId: c.productId,
                  variantId: c.variantId,
                  productName: c.productName,
                  size: c.size,
                  colour: c.colour,
                  unitPrice: c.price,
                  quantity: c.quantity,
                  subtotal: c.price * c.quantity,
                  image: c.image,
                })),
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
            'Some items in your cart exceed available stock. Your cart has been updated with the latest quantities. Please review and try again.'
          );
          validateAndSyncCart();
        } else if (status === 404) {
          // Never display internal strings such as "variantId 21, productId 4"
          setServerError(
            'Unable to complete checkout because one or more items in your cart are no longer available. Your cart has been refreshed. Please review your items.'
          );
          validateAndSyncCart();
        } else if (status === 400) {
          const rawMsg = data?.message || '';
          if (
            rawMsg.toLowerCase().includes('no longer active') ||
            rawMsg.toLowerCase().includes('inactive')
          ) {
            setServerError(
              'One or more products in your cart are no longer active. Your cart has been refreshed. Please review your order.'
            );
            validateAndSyncCart();
          } else if (Array.isArray(data?.errors) && data.errors.length > 0) {
            setServerError(data.errors.join(' • '));
          } else {
            setServerError(data?.message || 'Please verify your customer details and try again.');
          }
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
    const isWhatsApp = orderSuccess.paymentMethod === 'whatsapp';
    const isPayHere = orderSuccess.paymentMethod === 'payhere';
    const isCOD = orderSuccess.paymentMethod === 'cash_on_delivery';

    // Generate WhatsApp click-to-chat payload if WhatsApp was selected
    const {
      url: whatsappUrl,
      message: whatsappMessage,
      error: whatsappConfigError,
    } = isWhatsApp
      ? generateWhatsAppOrderUrl(orderSuccess)
      : { url: null, message: '', error: null };

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

          {/* PayHere Return Callback Notice (if returning from redirect) */}
          {payhereReturnNotice && (
            <div
              className={`mt-6 p-4 rounded-2xl border flex items-start space-x-3 text-xs sm:text-sm ${
                payhereReturnNotice.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              {payhereReturnNotice.status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">
                  {payhereReturnNotice.status === 'success'
                    ? 'PayHere Gateway Checkout Completed'
                    : 'PayHere Checkout Cancelled'}
                </p>
                <p className="leading-relaxed">
                  {payhereReturnNotice.status === 'success'
                    ? `Payment process completed via PayHere. Your payment status will update once our server receives the confirmed notification.`
                    : `Your payment was cancelled at the PayHere checkout. Your order (#${orderSuccess.orderId}) remains saved as '${orderSuccess.paymentStatus}'. You can retry payment below.`}
                </p>
              </div>
            </div>
          )}

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
              <span className="text-xs text-gray-500 font-medium block">Payment Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold mt-1 capitalize ${
                  orderSuccess.paymentStatus === 'paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : orderSuccess.paymentStatus === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {orderSuccess.paymentStatus}
              </span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 1: PAYHERE SANDBOX CHECKOUT FLOW (PAYHERE ORDERS) */}
          {/* ======================================================== */}
          {isPayHere && (
            <div className="mt-8 bg-indigo-50/60 border border-indigo-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    Pay with PayHere Sandbox
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Your order details and stock reservation have been confirmed. Proceed to the PayHere Sandbox payment gateway to complete your payment.
                  </p>
                </div>
              </div>

              {/* If PayHere is properly configured and parameters are available */}
              {orderSuccess.payhere && orderSuccess.payhere.isConfigured && orderSuccess.payhere.params ? (
                <div className="pt-2 space-y-3">
                  <form
                    action={orderSuccess.payhere.checkoutUrl}
                    method="POST"
                    className="inline-block w-full sm:w-auto"
                  >
                    {/* Hidden PayHere Checkout Form Parameters */}
                    {Object.entries(orderSuccess.payhere.params).map(([paramKey, paramValue]) => (
                      <input
                        key={paramKey}
                        type="hidden"
                        name={paramKey}
                        value={paramValue}
                      />
                    ))}

                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-indigo-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.99] cursor-pointer"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Proceed to PayHere Sandbox • {formatLKR(orderSuccess.total)}</span>
                      <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                    </button>
                  </form>

                  <p className="text-[11px] text-gray-500 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      PayHere Sandbox accepts Visa, MasterCard, AMEX, eZ Cash, mCash, and Internet Banking.
                    </span>
                  </p>
                </div>
              ) : (
                /* Graceful Notice if PayHere credentials are not configured on server */
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center space-x-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>PayHere Sandbox Configuration Notice</span>
                  </div>
                  <p className="leading-relaxed">
                    {orderSuccess.payhere?.message ||
                      'PayHere merchant credentials are not currently configured on the server.'}
                  </p>
                  <p className="text-[11px] text-amber-700">
                    Your order (#<strong>{orderSuccess.orderId}</strong>) has been reserved. You can configure{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">PAYHERE_MERCHANT_ID</code> and{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">PAYHERE_MERCHANT_SECRET</code> in the backend environment to enable active checkout redirects.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 2: WHATSAPP ORDER FLOW (ONLY FOR WHATSAPP)        */}
          {/* ======================================================== */}
          {isWhatsApp && (
            <div className="mt-8 bg-emerald-50/60 border border-emerald-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    Continue Order on WhatsApp
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                    Your order details have been securely recorded. Click the button below to open WhatsApp and send your pre-formatted order summary to our support team for immediate verification.
                  </p>
                </div>
              </div>

              {/* Action Button: Valid URL */}
              {whatsappUrl && (
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-emerald-100 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.99]"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Continue on WhatsApp</span>
                    <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                    className="inline-flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>{showWhatsAppPreview ? 'Hide Message Preview' : 'Preview Message'}</span>
                  </button>
                </div>
              )}

              {/* Graceful Missing WhatsApp Business Number Notice */}
              {whatsappConfigError && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>WhatsApp Business Configuration Notice</span>
                  </div>
                  <p className="leading-relaxed">{whatsappConfigError}</p>
                  <p className="text-[11px] text-amber-700">
                    To enable direct click-to-chat links, set{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_WHATSAPP_NUMBER</code> in your{' '}
                    <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">.env</code> file. You can still preview and copy the generated order summary below.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowWhatsAppPreview(!showWhatsAppPreview)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-colors"
                    >
                      <span>{showWhatsAppPreview ? 'Hide Message Text' : 'View & Copy Message'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Expandable Formatted WhatsApp Message Preview */}
              {showWhatsAppPreview && (
                <div className="pt-3 border-t border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Generated WhatsApp Message
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (whatsappMessage) {
                          navigator.clipboard.writeText(whatsappMessage);
                          setCopiedMessage(true);
                          setTimeout(() => setCopiedMessage(false), 2500);
                        }
                      }}
                      className="inline-flex items-center space-x-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold transition-colors"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap font-sans max-h-60 overflow-y-auto leading-relaxed shadow-inner">
                    {whatsappMessage}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 3: CASH ON DELIVERY FLOW (ONLY FOR COD)          */}
          {/* ======================================================== */}
          {isCOD && (
            <div className="mt-6 bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start space-x-3.5">
              <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900 space-y-1">
                <p className="font-semibold">Next Step: Cash on Delivery Dispatch</p>
                <p className="text-amber-800 leading-relaxed">
                  Your package will be dispatched with our courier service. Please have the exact cash amount ({formatLKR(orderSuccess.total)}) ready upon delivery at your doorstep.
                </p>
              </div>
            </div>
          )}

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

            {/* Items Summary (Server-calculated values) */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center space-x-1.5">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Items Ordered ({orderSuccess.items.length})</span>
              </h2>
              <div className="bg-white border border-gray-200/80 rounded-2xl p-4 divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {orderSuccess.items.map((item, idx) => {
                  const unitPrice = item.unitPrice ?? item.price ?? 0;
                  const itemSubtotal = item.subtotal ?? unitPrice * item.quantity;

                  return (
                    <div
                      key={idx}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <div className="flex items-center space-x-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 text-gray-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {item.productName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.size} • {item.colour} • Qty {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 shrink-0 pl-2">
                        {formatLKR(itemSubtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Action Buttons */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={`/orders/${orderSuccess.orderId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <Package className="w-4 h-4" />
              <span>View Order #{orderSuccess.orderId}</span>
            </Link>
            <Link
              to="/orders"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm transition-colors"
            >
              <span>Order History</span>
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
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
    <div className="max-w-7xl 2xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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

      {/* Cart Inventory Sync Notice */}
      {cartSyncNotice && (
        <div
          role="status"
          className="mb-8 p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start space-x-3.5 text-xs sm:text-sm"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-bold text-amber-950">{cartSyncNotice.message}</p>
            {cartSyncNotice.issues && cartSyncNotice.issues.length > 0 && (
              <ul className="list-disc list-inside text-amber-800 text-xs space-y-0.5 pt-1">
                {cartSyncNotice.issues.map((issue, idx) => (
                  <li key={idx}>{issue}</li>
                ))}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCartSyncNotice(null)}
            className="text-amber-600 hover:text-amber-800 text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

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
                  <label
                    htmlFor="customer-name"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                  >
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
                    <label
                      htmlFor="customer-email"
                      className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                    >
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
                    <label
                      htmlFor="customer-phone"
                      className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                    >
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
                  <label
                    htmlFor="customer-address"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                  >
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
                  <label
                    htmlFor="customer-city"
                    className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5"
                  >
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
                    <label
                      htmlFor="customer-notes"
                      className="block text-xs sm:text-sm font-semibold text-gray-700"
                    >
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
                  <span className="font-semibold">Notice:</span> Selecting PayHere Sandbox enables secure card/wallet payment. Placing an order reserves your stock before redirecting to the payment gateway.
                </p>
              </div>

              {/* Radio Group / Selectable Cards */}
              <fieldset className="mt-6 space-y-5">
                <legend className="sr-only">Choose a payment method</legend>

                {/* Primary Recommended Methods (WhatsApp & PayHere) */}
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Recommended Payment Methods
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {PAYMENT_METHODS.filter((m) => m.isPrimary).map((method) => {
                      const Icon = method.icon;
                      const isSelected = paymentMethod === method.id;

                      return (
                        <label
                          key={method.id}
                          htmlFor={`payment-${method.id}`}
                          className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-1 ring-indigo-500'
                              : 'border-gray-200/90 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${method.iconBg}`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="text-sm font-bold text-gray-900 block leading-snug">
                                  {method.title}
                                </span>
                              </div>
                            </div>
                            <input
                              type="radio"
                              id={`payment-${method.id}`}
                              name="paymentMethod"
                              value={method.id}
                              checked={isSelected}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 shrink-0"
                            />
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed mb-3">
                            {method.description}
                          </p>
                          <div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${method.badgeColor}`}
                            >
                              {method.badge}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Alternative Payment Option (Cash on Delivery) */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                    Alternative Payment Option
                  </p>
                  {PAYMENT_METHODS.filter((m) => !m.isPrimary).map((method) => {
                    const Icon = method.icon;
                    const isSelected = paymentMethod === method.id;

                    return (
                      <label
                        key={method.id}
                        htmlFor={`payment-${method.id}`}
                        className={`relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            id={`payment-${method.id}`}
                            name="paymentMethod"
                            value={method.id}
                            checked={isSelected}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <div
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${method.iconBg}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-gray-900 block">
                              {method.title}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {method.description}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${method.badgeColor}`}
                        >
                          {method.badge}
                        </span>
                      </label>
                    );
                  })}
                </div>
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
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="py-3.5 first:pt-0 last:pb-0 flex space-x-3.5"
                >
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
