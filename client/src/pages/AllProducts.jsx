import React, { useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import SectionTitle from '../components/SectionTitle';
import { categories } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const SORTS = {
    newest: { label: 'Newest first', compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
    priceLow: { label: 'Price: low to high', compare: (a, b) => a.offerPrice - b.offerPrice },
    priceHigh: { label: 'Price: high to low', compare: (a, b) => b.offerPrice - a.offerPrice },
    discount: { label: 'Biggest discount', compare: (a, b) => (b.price - b.offerPrice) / b.price - (a.price - a.offerPrice) / a.price },
};

const AllProducts = () => {
    const { products, productsLoading, productsError, fetchProducts, searchQuery, setSearchQuery } = useAppContext();
    const [activeCategory, setActiveCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [onlyInStock, setOnlyInStock] = useState(false);

    const filteredProducts = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return products
            .filter((product) => !query || product.name.toLowerCase().includes(query))
            .filter((product) => activeCategory === 'All' || product.category === activeCategory)
            .filter((product) => !onlyInStock || product.inStock)
            .sort((a, b) => Number(b.inStock) - Number(a.inStock) || SORTS[sortBy].compare(a, b)); // available first, then chosen order
    }, [products, searchQuery, activeCategory, sortBy, onlyInStock]);

    const hasFilters = searchQuery.trim() || activeCategory !== 'All' || onlyInStock;
    const clearFilters = () => { setSearchQuery(''); setActiveCategory('All'); setOnlyInStock(false); };

    return (
        <div className='mt-16 flex flex-col'>
            <SectionTitle as="h1">{searchQuery.trim() ? `Results for "${searchQuery.trim()}"` : 'All Products'}</SectionTitle>

            {/* Filters: category chips + sort + availability */}
            <div className='flex flex-col gap-4 mb-8'>
                <div className='flex gap-2 overflow-x-auto pb-1' role="group" aria-label="Filter by category">
                    {['All', ...categories.map((c) => c.path)].map((name) => (
                        <button
                            key={name}
                            onClick={() => setActiveCategory(name)}
                            aria-pressed={activeCategory === name}
                            className={`shrink-0 px-4 py-1.5 rounded-full border text-sm transition active:scale-95 cursor-pointer ${activeCategory === name
                                ? 'bg-primary text-white border-primary shadow'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary-dull'}`}
                        >
                            {name}
                        </button>
                    ))}
                </div>

                <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600'>
                    <p aria-live="polite">{productsLoading ? 'Loading...' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`}</p>
                    <div className='flex items-center gap-4'>
                        <label className='flex items-center gap-2 cursor-pointer select-none'>
                            <input type="checkbox" checked={onlyInStock} onChange={(e) => setOnlyInStock(e.target.checked)} className='accent-[#4fbf8b] w-4 h-4' />
                            In stock only
                        </label>
                        <label className='flex items-center gap-2'>
                            <span className='sr-only sm:not-sr-only'>Sort by</span>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className='field !w-auto !py-1.5 text-sm' aria-label="Sort products">
                                {Object.entries(SORTS).map(([key, { label }]) => <option key={key} value={key}>{label}</option>)}
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            {productsLoading ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
                    <ProductSkeleton count={10} />
                </div>
            ) : productsError ? (
                <EmptyState icon="⚠️" title="Could not load products" message="Please check your connection and try again." actionLabel="Retry" onAction={fetchProducts} />
            ) : filteredProducts.length === 0 ? (
                hasFilters ? (
                    <EmptyState icon="🔍" title="No products found" message="Try a different keyword or clear your filters." actionLabel="Clear filters" onAction={clearFilters} />
                ) : (
                    <EmptyState icon="🥬" title="No products yet" message="The store is being stocked. Please check back soon." />
                )
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllProducts;
