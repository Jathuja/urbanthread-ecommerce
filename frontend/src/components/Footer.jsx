import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-gray-900 group inline-flex">
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
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Shop
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Men
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Women
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center space-x-2.5 text-sm text-gray-600">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <a
                  href="mailto:support@urbanthread.com"
                  className="hover:text-indigo-600 transition-colors"
                >
                  support@urbanthread.com
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-gray-600">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <a
                  href="tel:+94112345678"
                  className="hover:text-indigo-600 transition-colors"
                >
                  +94 11 234 5678
                </a>
              </li>
              <li className="flex items-center space-x-2.5 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar / Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500">
          <p>© 2026 UrbanThread. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Crafted for modern fashion enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
