import React from 'react'
import ProductCard from './ProductCard.jsx'
import ProductSkeleton from './ProductSkeleton.jsx'
import SectionTitle from './SectionTitle.jsx'
import { useAppContext } from '../context/AppContext.jsx'

const BestSeller = () => {
    const { products, productsLoading } = useAppContext();
    const items = products.filter((product) => product.inStock).slice(0, 5);

    // nothing to show yet (no products added by the seller)
    if (!productsLoading && items.length === 0) return null;

    return (
        <section className='mt-16'>
            <SectionTitle>Best Sellers</SectionTitle>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
                {productsLoading ? <ProductSkeleton count={5} /> : items.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </section>
    )
}
export default BestSeller
