import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingBag,
  Package,
  Calendar,
  CreditCard,
  Truck,
  ArrowRight,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  MessageSquare,
  DollarSign,
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
    };
  }
  if (m === 'payhere') {
    return {
      label: 'PayHere Online Payment',
      icon: CreditCard,
      color: 'text-indigo-600',
    };
  }
  if (m === 'cash_on_delivery') {
    return {
      label: 'Cash on Delivery',
      icon: DollarSign,
      color: 'text-gray-700',
    };
  }
  return {
    label: method || 'Unknown',
    icon: CreditCard,
    color: 'text-gray-700',
  };
}

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      if (res.data && res.data.success) {
        setOrders(res.data.data || []);
      } else {
        throw new Error(res.data.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load order history. Please check connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'all') {
      const s = (order.orderStatus || '').toLowerCase();
      if (s !== statusFilter) return false;
    }

    // Search query: ID or product name (customer-scoped search)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchId = String(order.id).includes(q) || `#${order.id}`.includes(q);
      const matchItem = order.items?.some((item) =>
        item.productName?.toLowerCase().includes(q)
      );
      return matchId || matchItem;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-semibold">My Orders</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            My Orders
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your personal orders, shipment progress, and order summaries.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 self-start md:self-auto"
          title="Refresh orders list"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : 'text-gray-500'}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by Order #ID or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all cursor-pointer"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="h-5 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
                <div className="h-4 bg-gray-100 rounded w-1/2" />
                <div className="h-16 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto">
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-rose-900">Unable to load orders</h3>
            <p className="mt-1 text-sm text-rose-700">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              {searchQuery || statusFilter !== 'all'
                ? 'No matching orders found'
                : 'No orders yet'}
            </h3>
            <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'Try clearing your search query or choosing another status filter.'
                : 'When you place an order via WhatsApp, PayHere, or Cash on Delivery, it will appear here.'}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Clear Filters
                </button>
              )}
              <Link
                to="/products"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const orderBadge = getOrderStatusBadge(order.orderStatus);
              const paymentBadge = getPaymentStatusBadge(order.paymentStatus);
              const payMethod = getPaymentMethodDetails(order.paymentMethod);
              const isExpanded = !!expandedOrders[order.id];
              const OrderIcon = orderBadge.icon;
              const PayIcon = payMethod.icon;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 shadow-sm transition-all overflow-hidden"
                >
                  {/* Order Header Card */}
                  <div className="p-5 sm:p-6 bg-gray-50/60 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Left: ID & Date */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-lg font-black text-gray-900 tracking-tight">
                            Order #{order.id}
                          </span>
                          {/* Order Status Badge */}
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${orderBadge.bg}`}
                          >
                            <OrderIcon className="w-3.5 h-3.5" />
                            <span>{orderBadge.label}</span>
                          </span>

                          {/* Payment Status Badge */}
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${paymentBadge.bg}`}
                          >
                            Payment: {paymentBadge.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>Placed on {formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Right: Total & View Details Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                        <div className="text-left sm:text-right">
                          <span className="block text-xs text-gray-500 font-medium uppercase tracking-wider">
                            Total Amount
                          </span>
                          <span className="text-lg font-extrabold text-gray-900">
                            {formatLKR(order.total)}
                          </span>
                        </div>

                        <Link
                          to={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:gap-2"
                        >
                          <span>Full Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Summary Details Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Meta Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                      {/* Customer / Shipping */}
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Customer & Delivery
                        </span>
                        <div className="font-semibold text-gray-800">
                          {order.customer?.name}
                        </div>
                        <div className="text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {order.customer?.city || order.customer?.address}
                          </span>
                        </div>
                        <div className="text-gray-500">
                          {order.customer?.phone}
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Payment Method
                        </span>
                        <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <PayIcon className={`w-4 h-4 ${payMethod.color}`} />
                          <span>{payMethod.label}</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          Status: <span className="capitalize font-medium text-gray-700">{order.paymentStatus}</span>
                        </div>
                      </div>

                      {/* Financial Breakdown */}
                      <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 space-y-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                          Price Breakdown
                        </span>
                        <div className="flex justify-between text-gray-600 text-xs">
                          <span>Subtotal:</span>
                          <span className="font-medium text-gray-900">{formatLKR(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 text-xs">
                          <span>Delivery:</span>
                          <span className="text-emerald-600 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                          <span className="font-bold text-gray-900">Total:</span>
                          <span className="font-bold text-indigo-600">{formatLKR(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items Section Preview Toggle */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50/80 hover:bg-gray-100 rounded-xl text-xs sm:text-sm font-semibold text-gray-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-indigo-600" />
                          <span>
                            {order.items?.length || 0} Ordered{' '}
                            {order.items?.length === 1 ? 'Item' : 'Items'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600">
                          <span>{isExpanded ? 'Hide items' : 'View items'}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>

                      {/* Expandable Items Table */}
                      {isExpanded && (
                        <div className="mt-3 overflow-x-auto border border-gray-200 rounded-xl">
                          <table className="min-w-full divide-y divide-gray-200 text-left text-xs sm:text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-medium uppercase text-[10px] tracking-wider">
                              <tr>
                                <th scope="col" className="px-4 py-3">
                                  Product
                                </th>
                                <th scope="col" className="px-4 py-3">
                                  Size & Colour
                                </th>
                                <th scope="col" className="px-4 py-3 text-center">
                                  Qty
                                </th>
                                <th scope="col" className="px-4 py-3 text-right">
                                  Unit Price
                                </th>
                                <th scope="col" className="px-4 py-3 text-right">
                                  Item Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {order.items?.map((item) => {
                                const swatch = COLOUR_SWATCHES[item.colour];
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50/60">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                      {item.productName}
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
                                          {item.size}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                          {swatch && (
                                            <span
                                              className="w-2.5 h-2.5 rounded-full border border-gray-300"
                                              style={{ background: swatch }}
                                            />
                                          )}
                                          <span>{item.colour}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-center font-medium text-gray-700">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                      {formatLKR(item.unitPrice)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                                      {formatLKR(item.subtotal)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
