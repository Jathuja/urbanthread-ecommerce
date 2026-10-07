import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Trust Highlights Strip */}
      <div className="border-b border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-3 justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Islandwide Delivery</p>
                <p className="text-[11px] text-gray-500">Fast shipping to your doorstep</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">WhatsApp Support</p>
                <p className="text-[11px] text-gray-500">Direct order verification</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Secure Payments</p>
                <p className="text-[11px] text-gray-500">PayHere Sandbox & COD</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 justify-center sm:justify-start">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Easy Exchanges</p>
                <p className="text-[11px] text-gray-500">Hassle-free size replacement</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (Span 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 group inline-flex"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-extrabold tracking-tight">
                Urban<span className="text-indigo-600">Thread</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Curated clothing and modern apparel designed for effortless everyday style, premium comfort, and timeless fashion confidence.
            </p>
            <p className="text-xs text-gray-500">
              Colombo, Western Province, Sri Lanka.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-3.5">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/products?category=Men" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Men's Fashion
                </Link>
              </li>
              <li>
                <Link to="/products?category=Women" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Women's Wear
                </Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service & Links */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-3.5">
              Customer Service
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Order History & Tracking
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-3.5">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2.5 text-gray-600">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <a
                  href="mailto:support@urbanthread.com"
                  className="hover:text-indigo-600 transition-colors truncate"
                >
                  support@urbanthread.com
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-gray-600">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <a
                  href="tel:+94112345678"
                  className="hover:text-indigo-600 transition-colors"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-gray-600">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 UrbanThread. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link to="/products" className="hover:text-indigo-600 transition-colors">Shop</Link>
            <span>•</span>
            <Link to="/orders" className="hover:text-indigo-600 transition-colors">Orders</Link>
            <span>•</span>
            <Link to="/cart" className="hover:text-indigo-600 transition-colors">Cart</Link>
            <span>•</span>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
