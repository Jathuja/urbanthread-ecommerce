import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  User,
  LogOut,
  ShieldCheck,
  Package,
  LayoutDashboard,
  Menu,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors hover:text-indigo-600 ${
      isActive ? 'text-indigo-600' : 'text-gray-600'
    }`;

  const adminNavLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors hover:text-purple-600 ${
      isActive ? 'text-purple-700 font-bold' : 'text-gray-600'
    }`;

  // ──────────────────────────────────────────
  // CASE 1: UNAUTHENTICATED (GUEST) NAVBAR
  // ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* UrbanThread Branding */}
            <Link
              to="/login"
              className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 group"
              id="guest-logo-brand"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-gray-900 tracking-tight">
                Urban<span className="text-indigo-600">Thread</span>
              </span>
            </Link>

            {/* Guest Actions (Sign In / Create Account) */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                id="guest-signin-btn"
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 hover:text-indigo-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                id="guest-register-btn"
                className="inline-flex items-center space-x-1 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm"
              >
                <span>Create Account</span>
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ──────────────────────────────────────────
  // CASE 2: AUTHENTICATED ADMIN NAVBAR
  // ──────────────────────────────────────────
  if (user?.role === 'admin') {
    return (
      <header className="bg-white/95 backdrop-blur-md border-b border-purple-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Admin Branding */}
            <div className="flex items-center space-x-3">
              <Link
                to="/admin"
                className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 group"
                id="admin-logo-brand"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 group-hover:bg-purple-700 group-hover:text-white transition-colors duration-200 shadow-sm">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-extrabold text-gray-900 tracking-tight">
                  Urban<span className="text-purple-700">Thread</span>
                </span>
              </Link>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wider">
                Admin
              </span>
            </div>

            {/* Admin Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <NavLink to="/admin" end className={adminNavLinkClass} id="admin-nav-dashboard">
                <span className="flex items-center space-x-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </span>
              </NavLink>
              <NavLink to="/admin/products" className={adminNavLinkClass} id="admin-nav-products">
                <span className="flex items-center space-x-1.5">
                  <Package className="w-4 h-4" />
                  <span>Products</span>
                </span>
              </NavLink>
              <NavLink to="/admin/orders" className={adminNavLinkClass} id="admin-nav-orders">
                <span className="flex items-center space-x-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Orders</span>
                </span>
              </NavLink>
            </nav>

            {/* Admin Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/profile"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors"
                title="Account Settings"
                id="admin-nav-profile"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span className="max-w-[120px] truncate">{user?.name || 'Admin'}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
                title="Sign Out"
                id="admin-nav-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Hamburger Toggle for Admin */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-700 hover:text-purple-700 focus:outline-none rounded-lg"
                aria-label="Toggle admin menu"
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer for Admin */}
        {isOpen && (
          <div className="md:hidden border-t border-purple-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="space-y-1">
              <NavLink
                to="/admin"
                end
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                  }`
                }
              >
                Admin Dashboard
              </NavLink>
              <NavLink
                to="/admin/products"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                  }`
                }
              >
                Product Management
              </NavLink>
              <NavLink
                to="/admin/orders"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                  }`
                }
              >
                Order Management
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                  }`
                }
              >
                Account Settings
              </NavLink>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // ──────────────────────────────────────────
  // CASE 3: AUTHENTICATED CUSTOMER NAVBAR
  // ──────────────────────────────────────────
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Customer Logo / Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 group"
            id="customer-logo-brand"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-gray-900 tracking-tight">
              Urban<span className="text-indigo-600">Thread</span>
            </span>
          </Link>

          {/* Customer Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" end className={navLinkClass} id="nav-home">
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass} id="nav-shop">
              Shop
            </NavLink>
            <NavLink to="/orders" className={navLinkClass} id="nav-my-orders">
              My Orders
            </NavLink>
          </nav>

          {/* Customer Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Icon */}
            <Link
              to="/cart"
              id="nav-cart-btn"
              className="relative p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={`View shopping cart with ${cartCount} items`}
              title={`Cart (${cartCount} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            {/* Profile / Account Settings */}
            <Link
              to="/profile"
              id="nav-profile-btn"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              title="Account Settings"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span className="max-w-[120px] truncate">{user?.name}</span>
            </Link>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
              title="Sign Out"
              id="nav-logout-btn"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Right Controls: Cart + Hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600 focus:outline-none"
              aria-label={`View shopping cart with ${cartCount} items`}
              title={`Cart (${cartCount} items)`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-indigo-600 focus:outline-none rounded-lg"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer for Customer */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="space-y-1">
            <NavLink
              to="/"
              end
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              Shop
            </NavLink>
            <NavLink
              to="/orders"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              My Orders
            </NavLink>
            <NavLink
              to="/cart"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-xl text-base font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              <span>Cart</span>
              <span className="min-w-[18px] h-4 px-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </NavLink>
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col space-y-2">
            <div className="px-3 py-2 bg-gray-50 rounded-xl text-xs text-gray-600 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-600" />
              <div className="truncate">
                <span className="font-bold text-gray-900 block truncate">{user?.name}</span>
                <span className="text-gray-500 block truncate">{user?.email}</span>
              </div>
            </div>
            <NavLink
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                }`
              }
            >
              <User className="w-4 h-4 text-indigo-600" />
              <span>Account Settings</span>
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
