import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import SectionTitle from './SectionTitle';

// Real data: in-stock products with the biggest discount (MRP vs offer price)
const TopDeals = () => {
    const { products, productsLoading } = useAppContext();

    const deals = products
        .filter((p) => p.inStock && p.price > p.offerPrice)
        .sort((a, b) => (b.price - b.offerPrice) / b.price - (a.price - a.offerPrice) / a.price)
        .slice(0, 5);

    if (!productsLoading && deals.length === 0) return null;

    return (
        <section className="mt-16">
            <div className="flex items-end justify-between">
                <SectionTitle>🔥 Top Deals</SectionTitle>
                <Link to="/products" onClick={() => window.scrollTo(0, 0)} className="text-primary-dull hover:underline mb-6 text-sm md:text-base">View all →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                {productsLoading ? <ProductSkeleton count={5} /> : deals.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    );
};

export default TopDeals;
