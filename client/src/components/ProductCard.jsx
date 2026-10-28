import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from "../assets/assets.js";
import { useAppContext } from '../context/AppContext.jsx';
import { handleImageError } from '../utils/placeholder';
import { resolveImage } from '../utils/productImage';

const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems } = useAppContext();

    if (!product) return null;

    const link = `/products/${product.category.toLowerCase()}/${product._id}`;
    const quantity = cartItems[product._id];
    const discount = product.price > product.offerPrice
        ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
        : 0;
    const hasReviews = product.numReviews > 0;

    return (
        <div className="relative border border-gray-500/20 hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition rounded-lg md:px-4 px-3 py-3 bg-white w-full animate-fade-up">
            {discount > 0 && product.inStock && (
                <span className="absolute top-2 left-2 z-10 bg-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">{discount}% OFF</span>
            )}

            <Link to={link} onClick={() => window.scrollTo(0, 0)} aria-label={`View ${product.name}`} className="block">
                <div className="group flex items-center justify-center px-2 relative">
                    <img
                        className={`group-hover:scale-110 group-hover:-rotate-2 transition duration-300 max-w-26 md:max-w-36 h-28 md:h-32 object-contain ${!product.inStock ? 'opacity-40 grayscale' : ''}`}
                        src={resolveImage(product.image?.[0])}
                        alt={product.name}
                        onError={handleImageError}
                        loading="lazy"
                    />
                    {!product.inStock && (
                        <span className="absolute bg-gray-800/80 text-white text-xs px-3 py-1 rounded-full">Out of stock</span>
                    )}
                </div>

                <div className="text-gray-500/60 text-sm mt-1">
                    <p>{product.category}</p>
                    <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                </div>
            </Link>

            <div className="text-gray-500/60 text-sm">
                <div className="flex items-center gap-0.5 h-4" aria-label={hasReviews ? `Rated ${product.rating} out of 5` : 'No reviews yet'}>
                    {hasReviews ? (
                        <>
                            {Array(5).fill('').map((_, i) => (
                                <img key={i} className="md:w-3.5 w-3" src={i < Math.round(product.rating) ? assets.star_icon : assets.star_dull_icon} alt="" />
                            ))}
                            <p>({product.numReviews})</p>
                        </>
                    ) : (
                        <p className="text-xs">No reviews yet</p>
                    )}
                </div>

                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary-dull">
                        {currency}{product.offerPrice}
                        <span className="text-gray-500/60 md:text-sm text-xs line-through ml-1">{currency}{product.price}</span>
                    </p>

                    <div className="text-primary">
                        {!product.inStock ? (
                            <span className="text-xs text-gray-400">Unavailable</span>
                        ) : !quantity ? (
                            <button
                                aria-label={`Add ${product.name} to cart`}
                                className="flex items-center justify-center gap-1 bg-primary-soft border border-primary/40 hover:bg-primary/20 active:scale-95 md:w-[80px] w-[64px] h-[34px] rounded text-primary-dull font-medium transition cursor-pointer"
                                onClick={() => addToCart(product._id)}
                            >
                                <img src={assets.cart_icon} alt="" /> Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/20 rounded select-none">
                                <button aria-label={`Remove one ${product.name}`} onClick={() => removeFromCart(product._id)} className="cursor-pointer text-md px-2 h-full hover:text-primary-dull">-</button>
                                <span key={quantity} className="w-5 text-center text-primary-dull animate-pop" aria-live="polite">{quantity}</span>
                                <button aria-label={`Add one more ${product.name}`} onClick={() => addToCart(product._id)} className="cursor-pointer text-md px-2 h-full hover:text-primary-dull">+</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
