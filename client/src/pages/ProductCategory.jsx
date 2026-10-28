import React from 'react'
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import SectionTitle from '../components/SectionTitle';

const ProductCategory = () => {
    const { products, productsLoading } = useAppContext()
    const { category } = useParams()

    const searchCategory = categories.find((item) => item.path.toLowerCase() === category)
    const filteredProducts = products
        .filter((product) => product.category.toLowerCase() === category)
        .sort((a, b) => Number(b.inStock) - Number(a.inStock))

    if (!searchCategory) {
        return <EmptyState icon="🧭" title="Category not found" message="We could not find that category." actionLabel="Browse all products" actionTo="/products" />
    }

    return (
        <div className='mt-16'>
            <SectionTitle as="h1">{searchCategory.text}</SectionTitle>

            {productsLoading ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
                    <ProductSkeleton count={5} />
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6'>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <EmptyState icon="🥕" title={`No products in ${searchCategory.text} yet`} message="Check out our other categories in the meantime." actionLabel="Browse all products" actionTo="/products" />
            )}
        </div>
    )
}
export default ProductCategory;
