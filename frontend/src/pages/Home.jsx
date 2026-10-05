import HeroSection from '../components/HeroSection';
import CategorySection from '../components/CategorySection';
import FeaturedProducts from '../components/FeaturedProducts';
import PromoSection from '../components/PromoSection';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Category Section */}
      <CategorySection />

      {/* 3. Featured Products Section */}
      <FeaturedProducts />

      {/* 4. Promotional Banner Section */}
      <PromoSection />
    </div>
  );
}
