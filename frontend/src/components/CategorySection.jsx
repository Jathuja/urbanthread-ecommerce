import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    name: 'Men',
    description: 'Crisp tees, tailored pants, and timeless layers.',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
    itemCount: '7 Styles',
  },
  {
    name: 'Women',
    description: 'Breezy dresses, breathable blouses, and refined silhouettes.',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    itemCount: '3 Styles',
  },
  {
    name: 'Accessories',
    description: 'Structured bags, commuter packs, and versatile essentials.',
    image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=800&q=80',
    itemCount: '2 Styles',
  },
];

export default function CategorySection() {
  return (
    <section className="py-16 sm:py-20 bg-gray-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Explore curated collections designed with comfort, quality, and timeless appeal in mind.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white border border-gray-200/80 flex flex-col"
            >
              {/* Image with subtle hover zoom */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <img
                  src={cat.image}
                  alt={`${cat.name} clothing and apparel category collection`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                    {cat.itemCount}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-200 mt-1 line-clamp-2">
                    {cat.description}
                  </p>

                  <div className="mt-4 pt-2">
                    <Link
                      to="/products"
                      className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-white/20 hover:bg-white hover:text-gray-900 backdrop-blur-md px-4 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
