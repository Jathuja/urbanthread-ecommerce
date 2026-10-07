import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Verifying administrator authorization...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase text-rose-700 bg-rose-50 rounded-full border border-rose-200">
              403 Forbidden
            </span>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Admin Access Required
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed">
              You are signed in as <strong className="text-gray-800">{user?.name || user?.email}</strong> with customer privileges. This section is restricted exclusively to UrbanThread store administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
            <Link
              to="/orders"
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
