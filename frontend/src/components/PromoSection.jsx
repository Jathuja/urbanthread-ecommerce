import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

export default function PromoSection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white shadow-xl">
          {/* Subtle Background Pattern & Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_50%)]"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16">
            {/* Promo Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5" />
                <span>Modern Wardrobe Staples</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Everyday Essentials
              </h2>

              <p className="text-xl sm:text-2xl font-light text-indigo-200">
                Simple pieces. Better style.
              </p>

              <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Curated clothing tailored for longevity, easy pairing, and elevated comfort. Discover shirts, denim, outerwear, and accessories built for your daily rhythm.
              </p>

              <div className="pt-3">
                <Link
                  to="/products"
                  className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-950 font-bold text-base shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <span>Shop Now</span>
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                </Link>
              </div>
            </div>

            {/* Promo Image Vignette */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] max-w-md mx-auto lg:max-w-none">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
                  alt="UrbanThread everyday minimalist fashion wardrobe apparel"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <span className="text-xs font-medium text-white/90 drop-shadow">
                    Premium Cotton • Clean Lines • Timeless Fit
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
