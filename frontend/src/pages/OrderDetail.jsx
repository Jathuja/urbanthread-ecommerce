import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Calendar,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Mail,
  Phone,
  User,
  MessageSquare,
  DollarSign,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { generateWhatsAppOrderUrl } from '../utils/whatsapp';

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

function formatLKR(amount) {
  return `LKR ${Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getOrderStatusBadge(status) {
  const norm = (status || '').toLowerCase();
  if (norm === 'completed' || norm === 'delivered') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      label: 'Completed',
    };
  }
  if (norm === 'processing') {
    return {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: RefreshCw,
      label: 'Processing',
    };
  }
  if (norm === 'cancelled') {
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      label: 'Cancelled',
    };
  }
  return {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock,
    label: 'Pending',
  };
}

function getPaymentStatusBadge(status) {
  const norm = (status || '').toLowerCase();
  if (norm === 'paid') {
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Paid',
    };
  }
  if (norm === 'failed') {
    return {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Failed',
    };
  }
  return {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Pending',
  };
}

function getPaymentMethodDetails(method) {
  const m = (method || '').toLowerCase();
  if (m === 'whatsapp') {
    return {
      label: 'WhatsApp Order',
      icon: MessageSquare,
      color: 'text-emerald-600',
      desc: 'Order confirmed and managed directly through WhatsApp customer support.',
    };
  }
  if (m === 'payhere') {
    return {
      label: 'PayHere Online Payment',
      icon: CreditCard,
      color: 'text-indigo-600',
      desc: 'Online card payment through PayHere secure gateway.',
    };
  }
  if (m === 'cash_on_delivery') {
    return {
      label: 'Cash on Delivery',
      icon: DollarSign,
      color: 'text-gray-700',
      desc: 'Pay cash to the courier upon delivery at your doorstep.',
    };
  }
  return {
    label: method || 'Standard Payment',
    icon: CreditCard,
    color: 'text-gray-700',
    desc: 'Standard payment processing.',
  };
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/orders/${id}`);
        if (res.data && res.data.success) {
          setOrder(res.data.data);
        } else {
          throw new Error(res.data.message || 'Order not found');
        }
      } catch (err) {
        console.error('Failed to load order:', err);
        setError(
          err.response?.data?.message ||
            err.message ||
            `Order #${id} could not be retrieved.`
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCopyId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(String(order.id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-white rounded-2xl border border-gray-200 p-6" />
          <div className="h-64 bg-white rounded-2xl border border-gray-200 p-6" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          {error || `We couldn't find any order matching ID #${id}.`}
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/orders"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  const orderBadge = getOrderStatusBadge(order.orderStatus);
  const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
  const payMethod = getPaymentMethodDetails(order.paymentMethod);
  const OrderIcon = orderBadge.icon;
  const PayIcon = payMethod.icon;

  // WhatsApp click-to-chat URL if applicable
  const whatsappUrl =
    order.paymentMethod === 'whatsapp'
      ? generateWhatsAppOrderUrl({
          orderId: order.id,
          customer: order.customer,
          items: order.items,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.total,
          paymentMethod: order.paymentMethod,
          orderStatus: order.orderStatus,
        })
      : null;

  return (
    <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Navigation / Back link */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            title="Copy Order ID"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gray-400" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Banner */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Order #{order.id}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${orderBadge.bg}`}
                >
                  <OrderIcon className="w-3.5 h-3.5" />
                  <span>{orderBadge.label}</span>
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${paymentBadge.bg}`}
                >
                  Payment: {paymentBadge.label}
                </span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-semibold">
                Total Paid / Due
              </span>
              <span className="text-2xl sm:text-3xl font-black text-indigo-600">
                {formatLKR(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Customer & Shipping Details */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Customer & Delivery Address
            </h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-semibold text-gray-900">{order.customer?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{order.customer?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{order.customer?.phone}</span>
                </div>
              </div>

              <div className="space-y-1.5 md:border-l md:border-gray-200 md:pl-5">
                <div className="text-gray-900 font-medium">
                  {order.customer?.address}
                </div>
                <div className="text-gray-600">
                  {order.customer?.city}, Sri Lanka
                </div>
                {order.customer?.notes && (
                  <div className="mt-2 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded-lg">
                    <span className="font-bold">Delivery Note:</span> {order.customer.notes}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Method Details */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              Payment Information
            </h2>
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <PayIcon className={`w-5 h-5 ${payMethod.color}`} />
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{payMethod.label}</div>
                  <div className="text-xs text-gray-500">{payMethod.desc}</div>
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 transition-colors shrink-0 shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Ordered Items Table */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Ordered Items ({order.items?.length || 0})
            </h2>

            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      Product Name
                    </th>
                    <th scope="col" className="px-5 py-3.5">
                      Variant (Size / Colour)
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center">
                      Qty
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Unit Price
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {order.items?.map((item) => {
                    const swatch = COLOUR_SWATCHES[item.colour];
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-4 font-bold text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-bold">
                              {item.size}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              {swatch && (
                                <span
                                  className="w-3 h-3 rounded-full border border-gray-300"
                                  style={{ background: swatch }}
                                />
                              )}
                              <span>{item.colour}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600">
                          {formatLKR(item.unitPrice)}
                        </td>
                        <td className="px-5 py-4 text-right font-extrabold text-gray-900">
                          {formatLKR(item.subtotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-80 bg-gray-50 rounded-2xl p-5 border border-gray-200/80 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">{formatLKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee:</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between text-base">
                <span className="font-extrabold text-gray-900">Total:</span>
                <span className="font-black text-indigo-600">{formatLKR(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Support Notice */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Need assistance with this order? Contact UrbanThread customer support.</span>
          </div>

          <Link
            to="/products"
            className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>Continue Shopping</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
