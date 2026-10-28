import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
    // the mobile menu is "open" only for the page it was opened on, so it closes by itself on navigation
    const [menuPath, setMenuPath] = useState(null);
    const { user, setShowUserLogin, navigate, getCartCount, searchQuery, setSearchQuery, logout } = useAppContext();
    const { pathname } = useLocation();
    const cartCount = getCartCount();
    const [scrolled, setScrolled] = useState(false);
    const open = menuPath === pathname;
    const setOpen = (value) => setMenuPath(value ? pathname : null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const onSearch = (value) => {
        setSearchQuery(value);
        if (value.trim() && pathname !== '/products') navigate('/products');
    };

    const linkClass = ({ isActive }) => `nav-link hover:text-primary-dull transition ${isActive ? 'active text-primary-dull' : ''}`;

    const searchBox = (className = '') => (
        <form role="search" onSubmit={(e) => e.preventDefault()} className={`flex items-center text-sm gap-2 border border-gray-300 focus-within:border-primary px-3 rounded-full ${className}`}>
            <input
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500"
                type="search"
                placeholder="Search products"
                aria-label="Search products"
            />
            <img src={assets.search_icon} alt="" className="w-4 h-4" />
        </form>
    );

    return (
        <nav className={`sticky top-0 z-40 flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b bg-white/90 backdrop-blur transition-shadow ${scrolled ? 'shadow-md border-transparent' : 'border-gray-300'}`}>
            <NavLink to="/" aria-label="GreenCart home"><img className="h-9 w-auto" src={assets.logo} alt="GreenCart" /></NavLink>

            <div className="hidden sm:flex items-center gap-8">
                <NavLink to="/" className={linkClass}>Home</NavLink>
                <NavLink to="/products" className={linkClass}>All Products</NavLink>
                <NavLink to="/contact" className={linkClass}>Contact</NavLink>

                {searchBox('hidden lg:flex')}

                <button onClick={() => navigate('/cart')} className="relative cursor-pointer" aria-label={`Cart, ${cartCount} items`}>
                    <img src={assets.nav_cart_icon} alt="" className="w-6 opacity-80" />
                    {cartCount > 0 && <span key={cartCount} className="animate-pop absolute -top-2 -right-3 text-xs text-white bg-primary min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">{cartCount}</span>}
                </button>

                {!user ? (
                    <button onClick={() => setShowUserLogin(true)} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">Login</button>
                ) : (
                    <div className="relative group">
                        <button aria-haspopup="menu" aria-label="Account menu" className="block cursor-pointer">
                            <img src={assets.profile_icon} className="w-10 h-10 rounded-full object-cover border border-gray-300" alt="" />
                        </button>
                        <ul role="menu" className="hidden group-hover:block group-focus-within:block absolute right-0 top-10 bg-white shadow-md border border-gray-200 py-2 w-40 z-50 rounded-md text-sm">
                            <li className="px-4 py-2 text-gray-500 truncate border-b border-gray-100">Hi, {user.name}</li>
                            <li role="menuitem"><Link to="/my-orders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link></li>
                            <li role="menuitem"><button onClick={logout} className="w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">Logout</button></li>
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-5 sm:hidden">
                <button onClick={() => navigate('/cart')} className="relative cursor-pointer" aria-label={`Cart, ${cartCount} items`}>
                    <img src={assets.nav_cart_icon} alt="" className="w-6 opacity-80" />
                    {cartCount > 0 && <span key={cartCount} className="animate-pop absolute -top-2 -right-3 text-xs text-white bg-primary min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">{cartCount}</span>}
                </button>
                <button onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open} aria-controls="mobile-menu" className="cursor-pointer">
                    <img src={assets.menu_icon} alt="" className="w-6" />
                </button>
            </div>

            {open && (
                <div id="mobile-menu" className="absolute top-full left-0 w-full bg-white shadow-md py-4 flex flex-col items-start gap-3 px-6 text-sm sm:hidden z-50 animate-fade-up">
                    {searchBox('w-full')}
                    <NavLink to="/" className={linkClass}>Home</NavLink>
                    <NavLink to="/products" className={linkClass}>All Products</NavLink>
                    <NavLink to="/contact" className={linkClass}>Contact</NavLink>
                    {!user ? (
                        <button onClick={() => { setShowUserLogin(true); setOpen(false); }} className="px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer">Login</button>
                    ) : (
                        <>
                            <NavLink to="/my-orders" className={linkClass}>My Orders</NavLink>
                            <button onClick={logout} className="cursor-pointer">Logout</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
