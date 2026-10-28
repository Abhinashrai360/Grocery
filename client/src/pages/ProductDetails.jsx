import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import SectionTitle from "../components/SectionTitle";
import { handleImageError } from "../utils/placeholder";
import { resolveImage } from "../utils/productImage";

const ProductDetails = () => {
    const { products, productsLoading, navigate, currency, addToCart } = useAppContext();
    const { id } = useParams()
    const [selectedImage, setSelectedImage] = useState(null);

    const product = products.find((item) => item._id === id);

    const relatedProducts = useMemo(() => {
        if (!product) return [];
        return products
            .filter((item) => item.category === product.category && item._id !== product._id && item.inStock)
            .slice(0, 5);
    }, [products, product]);

    // the chosen image, or the first one when nothing (or an image of another product) is selected
    const thumbnail = product?.image?.includes(selectedImage) ? selectedImage : product?.image?.[0] || null;

    if (productsLoading) {
        return (
            <div className="mt-16 flex flex-col md:flex-row gap-10 max-w-6xl" aria-busy="true">
                <div className="skeleton w-full md:w-1/2 h-80" />
                <div className="w-full md:w-1/2 space-y-4">
                    <div className="skeleton h-8 w-2/3" />
                    <div className="skeleton h-5 w-1/4" />
                    <div className="skeleton h-24 w-full" />
                    <div className="skeleton h-12 w-full" />
                </div>
            </div>
        );
    }

    if (!product) {
        return <EmptyState icon="🤷" title="Product not found" message="This product may have been removed." actionLabel="Browse all products" actionTo="/products" />;
    }

    const hasReviews = product.numReviews > 0;
    const discount = product.price > product.offerPrice ? Math.round(((product.price - product.offerPrice) / product.price) * 100) : 0;

    return (
        <div className="max-w-6xl w-full mt-12">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
                <Link to="/" className="hover:text-primary-dull">Home</Link> /
                <Link to="/products" className="hover:text-primary-dull"> Products</Link> /
                <Link to={`/products/${product.category.toLowerCase()}`} className="hover:text-primary-dull"> {product.category}</Link> /
                <span className="text-primary-dull"> {product.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-10 md:gap-16 mt-4">
                <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <div className="flex sm:flex-col gap-3">
                        {product.image.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(image)}
                                aria-label={`Show image ${index + 1}`}
                                className={`border w-20 rounded overflow-hidden cursor-pointer ${thumbnail === image ? 'border-primary' : 'border-gray-500/30'}`}
                            >
                                <img src={resolveImage(image)} alt="" onError={handleImageError} className="w-full" />
                            </button>
                        ))}
                    </div>

                    <div className="border border-gray-500/30 sm:max-w-100 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                        <img src={resolveImage(thumbnail)} alt={product.name} onError={handleImageError} className="w-full h-full object-contain" />
                    </div>
                </div>

                <div className="text-sm w-full md:w-1/2">
                    <h1 className="text-3xl font-medium">{product.name}</h1>

                    <div className="flex items-center gap-0.5 mt-1">
                        {hasReviews ? (
                            <>
                                {Array(5).fill('').map((_, i) => (
                                    <img key={i} src={i < Math.round(product.rating) ? assets.star_icon : assets.star_dull_icon} alt="" className="md:w-4 w-3.5" />
                                ))}
                                <p className="text-base ml-2">{product.rating.toFixed(1)} ({product.numReviews} reviews)</p>
                            </>
                        ) : (
                            <p className="text-gray-500">No reviews yet</p>
                        )}
                    </div>

                    <div className="mt-6">
                        <p className="text-gray-500/70 line-through">MRP: {currency}{product.price}</p>
                        <p className="text-2xl font-medium">
                            {currency}{product.offerPrice}
                            {discount > 0 && <span className="ml-3 text-sm bg-primary text-white px-2 py-0.5 rounded-full align-middle">{discount}% OFF</span>}
                        </p>
                        <span className="text-gray-500/70">(inclusive of all taxes)</span>
                    </div>

                    <p className={`mt-4 font-medium ${product.inStock ? 'text-primary-dull' : 'text-red-500'}`}>
                        {product.inStock ? '● In stock' : '● Out of stock'}
                    </p>

                    <p className="text-base font-medium mt-6">About Product</p>
                    <ul className="list-disc ml-4 text-gray-500/70">
                        {product.description.map((desc, index) => (
                            <li key={index}>{desc}</li>
                        ))}
                    </ul>

                    <div className="flex items-center mt-10 gap-4 text-base">
                        <button disabled={!product.inStock} onClick={() => addToCart(product._id)} className="w-full py-3.5 cursor-pointer font-medium bg-gray-100 text-gray-800/80 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition rounded">
                            Add to Cart
                        </button>
                        <button disabled={!product.inStock} onClick={() => { addToCart(product._id); navigate("/cart"); }} className="w-full py-3.5 cursor-pointer font-medium bg-primary text-white hover:bg-primary-dull disabled:opacity-50 disabled:cursor-not-allowed transition rounded">
                            Buy now
                        </button>
                    </div>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <section className="mt-20">
                    <SectionTitle>Related Products</SectionTitle>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {relatedProducts.map((item) => (
                            <ProductCard key={item._id} product={item} />
                        ))}
                    </div>
                    <div className="flex justify-center mt-10">
                        <Link to="/products" onClick={() => window.scrollTo(0, 0)} className="px-12 py-2.5 border border-primary text-primary-dull rounded hover:bg-primary/10 transition">See more</Link>
                    </div>
                </section>
            )}
        </div>
    );
};
export default ProductDetails
