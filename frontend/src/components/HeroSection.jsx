import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-indigo-50/20 to-gray-50 pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headings & CTAs */}
          <div className="lg:col-span-7 space-y-6 lg:space-y-8 text-center lg:text-left">
            {/* Subtle Brand Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>New Season 2026 Collection</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
              Style That Moves <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600">
                With You
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Discover modern essentials designed for everyday confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 font-semibold text-base shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl text-gray-800 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 font-semibold text-base shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Explore New Arrivals
              </Link>
            </div>

            {/* Value Props Strip */}
            <div className="pt-8 border-t border-gray-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center space-x-2.5">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-gray-600">Islandwide Delivery</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-gray-600">Verified Quality</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-medium text-gray-600">Easy Exchanges</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Decorative Accent Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-70"></div>

              {/* Main Image Container */}
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-100 bg-white aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
                  alt="UrbanThread Fashion Collection model wearing contemporary everyday apparel"
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />

                {/* Floating Micro-Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-xl border border-white/60 shadow-lg flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold tracking-wider text-indigo-600 uppercase block">
                      Featured Outfit
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      Minimal Summer & Casual Edit
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
                    In Stock
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
