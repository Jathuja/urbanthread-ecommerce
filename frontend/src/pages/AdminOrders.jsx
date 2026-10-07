import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Truck,
  RotateCcw,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  ShieldCheck,
  LayoutDashboard,
  Package,
  X,
  AlertTriangle,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmed',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle2,
  },
  processing: {
    label: 'Processing',
    bg: 'bg-indigo-50',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    icon: RefreshCw,
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-200',
    icon: Truck,
  },
  delivered: {
    label: 'Delivered',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200',
    icon: XCircle,
  },
};

const PAYMENT_STATUS_CONFIG = {
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
  },
};

const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'shipped', 'cancelled'],
  processing: ['shipped', 'delivered', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [], // Terminal
  cancelled: [], // Terminal
};

export default function AdminOrders() {
  const { user } = useAuth();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Status Update state
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [confirmStatusModal, setConfirmStatusModal] = useState(null); // { orderId, targetStatus }

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        params: {
          search: searchQuery || undefined,
          order_status: selectedOrderStatus !== 'all' ? selectedOrderStatus : undefined,
          payment_status: selectedPaymentStatus !== 'all' ? selectedPaymentStatus : undefined,
          payment_method: selectedPaymentMethod !== 'all' ? selectedPaymentMethod : undefined,
        },
      });

      if (res.data?.success) {
        setOrders(res.data.data || []);
      } else {
        throw new Error(res.data?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      const msg = err.response?.data?.message || err.message || 'Error fetching orders';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedOrderStatus, selectedPaymentStatus, selectedPaymentMethod]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/orders/${orderId}`);
      if (res.data?.success) {
        setSelectedOrder(res.data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to fetch order details';
      showToast(msg, 'error');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, targetStatus) => {
    // If transitioning to terminal state, confirm with user
    if (targetStatus === 'delivered' || targetStatus === 'cancelled') {
      setConfirmStatusModal({ orderId, targetStatus });
      return;
    }

    await executeStatusUpdate(orderId, targetStatus);
  };

  const executeStatusUpdate = async (orderId, targetStatus) => {
    setStatusUpdating(true);
    try {
      const res = await axios.put(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
        status: targetStatus,
      });

      if (res.data?.success) {
        showToast(res.data.message || `Order #${orderId} status updated to ${targetStatus}`);
        setConfirmStatusModal(null);

        // Update local list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: targetStatus } : o))
        );

        // Update modal if open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(res.data.data);
        }
      } else {
        throw new Error(res.data?.message || 'Failed to update order status');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error updating order status';
      showToast(msg, 'error');
    } finally {
      setStatusUpdating(false);
    }
  };

  const formatCurrency = (val) => {
    return `LKR ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const config = ORDER_STATUS_CONFIG[s] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: Clock,
    };
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}
      >
        <Icon className="w-3 h-3 flex-shrink-0" />
        <span className="capitalize">{config.label}</span>
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    const config = PAYMENT_STATUS_CONFIG[s] || {
      label: status,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} capitalize`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const m = (method || '').toLowerCase();
    if (m === 'whatsapp') return 'WhatsApp Order';
    if (m === 'payhere') return 'PayHere Sandbox';
    if (m === 'cash_on_delivery') return 'Cash on Delivery';
    return m.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-indigo-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>UrbanThread Admin Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Order Management & Fulfillment
              </h1>
              <p className="text-sm text-indigo-200">
                Monitor global order queue, track delivery stages, and verify payment settlements.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchOrders()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Orders</span>
              </button>
            </div>
          </div>

          {/* Admin Subnav Tabs */}
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-indigo-700/50">
            <Link
              to="/admin"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              to="/admin/products"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                location.pathname === '/admin/products'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </Link>
            <Link
              to="/admin/orders"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                location.pathname === '/admin/orders'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Orders</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Filter and Search Bar Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID, name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Order Status Dropdown */}
            <div>
              <select
                value={selectedOrderStatus}
                onChange={(e) => setSelectedOrderStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 capitalize"
              >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Dropdown */}
            <div>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700 capitalize"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Payment Method Dropdown */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700"
              >
                <option value="all">All Gateways</option>
                <option value="whatsapp">WhatsApp Order</option>
                <option value="payhere">PayHere Sandbox</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
              </select>
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                {orders.length}
              </span>
            </div>
          </div>
        </div>

        {/* Orders Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Loading order records...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Failed to load orders</h3>
                <p className="text-xs text-rose-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => fetchOrders()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">No orders found</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your search criteria or filter options.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Payment</th>
                    <th className="py-3.5 px-6">Payment Status</th>
                    <th className="py-3.5 px-6">Order Status</th>
                    <th className="py-3.5 px-6 text-right">Total</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {orders.map((o) => {
                    const currentStatus = o.orderStatus?.toLowerCase();
                    const availableTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];
                    const isTerminal = availableTransitions.length === 0;

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Order ID */}
                        <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                          #{o.id}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-gray-900">{o.customer?.name}</div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {o.customer?.phone}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[150px]">
                            {o.customer?.email}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-6 text-gray-600 whitespace-nowrap">
                          {formatDate(o.createdAt)}
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span className="font-semibold text-gray-700">
                            {o.itemCount || o.items?.length || 1} items
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-6 whitespace-nowrap font-medium text-gray-700">
                          {getPaymentMethodLabel(o.paymentMethod)}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {getPaymentStatusBadge(o.paymentStatus)}
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          {getOrderStatusBadge(o.orderStatus)}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-6 text-right font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(o.total)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenDetails(o.id)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                              title="View full order details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </button>
                          </div>
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

      {/* ============================================================ */}
      {/* ORDER DETAILS MODAL                                          */}
      {/* ============================================================ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-gray-900">
                    Order #{selectedOrder.id}
                  </h2>
                  {getOrderStatusBadge(selectedOrder.orderStatus)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
                <p className="text-xs text-gray-500">
                  Placed on {formatDate(selectedOrder.createdAt)} • Payment:{' '}
                  <strong>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Workflow Action Panel */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                      Fulfillment Status Control
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Current:{' '}
                    <strong className="text-indigo-700 capitalize">
                      {selectedOrder.orderStatus}
                    </strong>
                  </span>
                </div>

                {ALLOWED_TRANSITIONS[selectedOrder.orderStatus?.toLowerCase()]?.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      Select next fulfillment state according to store processing stages:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALLOWED_TRANSITIONS[selectedOrder.orderStatus?.toLowerCase()].map((st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={statusUpdating}
                          onClick={() => handleUpdateStatus(selectedOrder.id, st)}
                          className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all capitalize ${
                            st === 'delivered'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : st === 'cancelled'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          <ArrowRight className="w-3 h-3" />
                          <span>Mark as {st}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-white/75 rounded-xl border border-indigo-100 text-xs text-gray-600">
                    This order is in a <strong>terminal state ({selectedOrder.orderStatus})</strong>{' '}
                    and cannot transition to any other active status.
                  </div>
                )}

                <div className="pt-2 border-t border-indigo-100 text-[11px] text-gray-500">
                  <span className="font-semibold text-gray-700">Payment Security Note:</span>{' '}
                  Payment status is governed by verified PayHere gateway callbacks and cannot be manually modified by admins.
                </div>
              </div>

              {/* Customer and Delivery Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Info */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Customer Information
                  </span>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p className="font-bold text-gray-900 flex items-center">
                      <User className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                      {selectedOrder.customer?.name}
                    </p>
                    <p className="flex items-center">
                      <Phone className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                      {selectedOrder.customer?.phone}
                    </p>
                    <p className="flex items-center">
                      <Mail className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                      {selectedOrder.customer?.email}
                    </p>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Shipping & Delivery Address
                  </span>
                  <div className="space-y-1.5 text-xs text-gray-700">
                    <p className="flex items-start">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600 mr-1.5 mt-0.5 flex-shrink-0" />
                      <span>
                        {selectedOrder.customer?.address}, {selectedOrder.customer?.city}
                      </span>
                    </p>
                    {selectedOrder.customer?.notes && (
                      <p className="flex items-start text-gray-500 italic">
                        <FileText className="w-3.5 h-3.5 text-gray-400 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span>"{selectedOrder.customer?.notes}"</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Purchased Items ({selectedOrder.items?.length || 0})
                </span>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                        <th className="py-2.5 px-4">Item</th>
                        <th className="py-2.5 px-4">Size</th>
                        <th className="py-2.5 px-4">Colour</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price</th>
                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items?.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {it.productName}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{it.size}</td>
                          <td className="py-3 px-4 text-gray-600">{it.colour}</td>
                          <td className="py-3 px-4 text-center font-bold text-gray-900">
                            {it.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-700">
                            {formatCurrency(it.unitPrice)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-900">
                            {formatCurrency(it.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-64 space-y-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-indigo-600">
                      {formatCurrency(selectedOrder.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-end bg-gray-50">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 text-xs font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TERMINAL STATUS CONFIRMATION MODAL                           */}
      {/* ============================================================ */}
      {confirmStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                confirmStatusModal.targetStatus === 'delivered'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-rose-50 text-rose-600 border border-rose-100'
              }`}
            >
              {confirmStatusModal.targetStatus === 'delivered' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900 capitalize">
                Confirm Status Change to "{confirmStatusModal.targetStatus}"?
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                {confirmStatusModal.targetStatus === 'delivered'
                  ? 'Marking this order as Delivered confirms customer handover. Once finalized as Delivered, it cannot be transitioned back to pending or processing.'
                  : 'Marking this order as Cancelled is a terminal cancellation. It cannot be reverted back to active processing.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setConfirmStatusModal(null)}
                disabled={statusUpdating}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  executeStatusUpdate(
                    confirmStatusModal.orderId,
                    confirmStatusModal.targetStatus
                  )
                }
                disabled={statusUpdating}
                className={`inline-flex items-center space-x-2 px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-colors ${
                  confirmStatusModal.targetStatus === 'delivered'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {statusUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  Confirm {confirmStatusModal.targetStatus === 'delivered' ? 'Delivery' : 'Cancellation'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
