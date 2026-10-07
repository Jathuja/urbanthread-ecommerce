import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Package,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Clock,
  Banknote,
  Calendar,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/dashboard`);
      if (res.data && res.data.success) {
        setData(res.data.data);
      } else {
        throw new Error(res.data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Failed to fetch admin dashboard:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error retrieving admin dashboard information.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

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

  const getStatusBadge = (status, type = 'order') => {
    const s = (status || '').toLowerCase();
    if (s === 'delivered' || s === 'paid' || s === 'completed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    if (s === 'pending' || s === 'processing') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    if (s === 'cancelled' || s === 'failed') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3 mr-1" />
          <span className="capitalize">{status}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize">
        {status || 'Unknown'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-900">Loading Admin Dashboard...</p>
          <p className="text-xs text-gray-500 mt-0.5">Fetching system analytics and recent activity</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <div>
            <h2 className="text-lg font-bold text-rose-900">Failed to Load Dashboard</h2>
            <p className="text-sm text-rose-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchDashboard()}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = stats.recentOrders || [];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-indigo-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>UrbanThread Admin Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Control & Overview Dashboard
              </h1>
              <p className="text-sm text-indigo-200">
                Logged in as <strong className="text-white">{data?.admin?.name || user?.name}</strong> ({data?.admin?.email || user?.email}) • Role:{' '}
                <span className="font-semibold text-emerald-300 uppercase tracking-wider text-xs">
                  {data?.admin?.role || 'admin'}
                </span>
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => fetchDashboard(true)}
                disabled={refreshing}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all backdrop-blur-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh Metrics'}</span>
              </button>
            </div>
          </div>

          {/* Admin Subnav Tabs */}
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-indigo-700/50">
            <Link
              to="/admin"
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-indigo-900 shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              to="/admin/products"
              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-200 hover:bg-white/10 transition-colors"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Products */}
          <Link
            to="/admin/products"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all block"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
                  Total Products
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                  {stats.totalProducts ?? 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Package className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                <span>Manage catalog items</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </Link>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total Orders
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                  {stats.totalOrders ?? 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5 text-purple-500 mr-1" />
              <span>{stats.todayOrders ?? 0} placed today</span>
            </div>
          </div>

          {/* Card 3: Pending Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pending Orders
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                  {stats.pendingOrders ?? 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
              <span>Awaiting fulfillment</span>
            </div>
          </div>

          {/* Card 4: Registered Customers */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registered Customers
                </p>
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                  {stats.totalCustomers ?? 0}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-teal-500 mr-1.5" />
              <span>Verified customer accounts</span>
            </div>
          </div>
        </div>

        {/* Secondary Row: Revenue Card + Quick Modules Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Revenue Highlight Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-indigo-100">
                <span className="text-xs font-bold uppercase tracking-wider">
                  Realized Revenue
                </span>
                <Banknote className="w-5 h-5 text-indigo-200" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
                {formatCurrency(stats.totalRevenue)}
              </h2>
              <p className="text-xs text-indigo-200 mt-2">
                Calculated strictly from paid orders across all payment gateways.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-500/40 flex items-center justify-between text-xs text-indigo-100">
              <span>Today's Placed Orders</span>
              <span className="font-bold text-white text-sm">{stats.todayOrders ?? 0}</span>
            </div>
          </div>

          {/* System Status / Modules Note */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">
                  Store Administration & RBAC Status
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  RBAC Active
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Role-based access control is actively protecting admin routes on both client and server.
                Admins have verified access to system metrics, customer summaries, and global order queues.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-800 flex items-center">
                  <Package className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                  Product Management
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Scheduled for upcoming assessment release
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs font-semibold text-gray-800 flex items-center">
                  <ShoppingBag className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                  Order Management
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Scheduled for upcoming assessment release
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-6 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Displaying the 5 most recent orders placed in the system
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {recentOrders.length} orders
            </span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ShoppingBag className="w-10 h-10 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-medium">No orders recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Order ID</th>
                    <th className="py-3 px-6">Customer</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Payment</th>
                    <th className="py-3 px-6">Payment Status</th>
                    <th className="py-3 px-6">Order Status</th>
                    <th className="py-3 px-6 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-gray-900">
                          {order.customerName}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate max-w-[180px]">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-gray-600 whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap font-medium text-gray-700 capitalize">
                        {order.paymentMethod?.replace(/_/g, ' ') || 'N/A'}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {getStatusBadge(order.paymentStatus, 'payment')}
                      </td>
                      <td className="py-3.5 px-6 whitespace-nowrap">
                        {getStatusBadge(order.orderStatus, 'order')}
                      </td>
                      <td className="py-3.5 px-6 text-right font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
