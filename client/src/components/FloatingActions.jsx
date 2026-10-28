import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const HIDE_CART_BAR_ON = ['/cart', '/add-address', '/loader'];

// Floating "View cart" bar (when the cart has items) + back-to-top button
const FloatingActions = () => {
    const { getCartCount, getCartAmount, currency } = useAppContext();
    const { pathname } = useLocation();
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 500);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const count = getCartCount();
    const showCart = count > 0 && !HIDE_CART_BAR_ON.includes(pathname);

    return (
        <>
            {showCart && (
                <Link
                    to="/cart"
                    className="fixed z-30 bottom-4 left-4 right-20 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 flex items-center justify-between gap-6 px-5 py-3 rounded-full bg-primary hover:bg-primary-dull text-white shadow-xl transition animate-fade-up"
                >
                    <span className="font-medium">View cart · {count} {count === 1 ? 'item' : 'items'}</span>
                    <span className="font-semibold">{currency}{getCartAmount()} →</span>
                </Link>
            )}
            {showTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    aria-label="Back to top"
                    className="fixed z-30 bottom-4 right-4 w-12 h-12 rounded-full bg-white border border-primary/40 text-primary-dull shadow-lg hover:bg-primary hover:text-white transition cursor-pointer animate-fade-up"
                >
                    ↑
                </button>
            )}
        </>
    );
};

export default FloatingActions;
