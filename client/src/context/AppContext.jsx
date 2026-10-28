import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Every request talks to our Express API and carries the httpOnly auth cookie
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const MAX_QTY = 99;

export const AppContext = createContext();

export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
    error?.response?.data?.message || (error?.request ? "Cannot reach the server. Check your connection." : fallback);

export const AppContextProvider = ({ children }) => {
    const currency = import.meta.env.VITE_CURRENCY || "₹";
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [authChecked, setAuthChecked] = useState(false); // user check finished
    const [sellerChecked, setSellerChecked] = useState(false); // seller check finished
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsError, setProductsError] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    // latest cart + user for handlers that run before React re-renders (fast double clicks)
    const cartRef = useRef({});
    const userRef = useRef(null);
    const syncTimer = useRef(null);
    useEffect(() => { userRef.current = user; }, [user]);

    // ---------- API loaders ----------
    const fetchProducts = useCallback(async () => {
        try {
            setProductsError(false);
            const { data } = await axios.get("/api/product/list");
            if (data.success) setProducts(data.products);
            else { setProductsError(true); toast.error(data.message); }
        } catch (error) {
            setProductsError(true);
            toast.error(getErrorMessage(error, "Could not load products"), { id: "products-error" });
        } finally {
            setProductsLoading(false);
        }
    }, []);

    const fetchSeller = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/seller/is-auth");
            setIsSeller(Boolean(data.success));
        } catch {
            setIsSeller(false);
        } finally {
            setSellerChecked(true);
        }
    }, []);

    // Pushes the cart to the server (debounced). Only for logged in users.
    const syncCart = useCallback((next, immediate = false) => {
        if (!userRef.current) return;
        clearTimeout(syncTimer.current);
        const send = async () => {
            try {
                await axios.post("/api/cart/update", { cartItems: next });
            } catch (error) {
                if (error?.response?.status !== 401) toast.error("Could not save your cart. Check your connection.", { id: "cart-sync" });
            }
        };
        if (immediate) send();
        else syncTimer.current = setTimeout(send, 400);
    }, []);

    const commitCart = useCallback((next) => {
        cartRef.current = next;
        setCartItems(next);
        syncCart(next);
    }, [syncCart]);

    // Loads the logged in user. When `mergeGuestCart` is true (right after login), items the visitor
    // added while logged out are merged into the saved cart instead of being lost.
    const fetchUser = useCallback(async (mergeGuestCart = false) => {
        try {
            const { data } = await axios.get("/api/user/is-auth");
            if (data.success) {
                userRef.current = data.user;
                setUser(data.user);

                const merged = { ...(data.user.cartItems || {}) };
                if (mergeGuestCart) {
                    for (const [id, qty] of Object.entries(cartRef.current)) {
                        merged[id] = Math.min((merged[id] || 0) + qty, MAX_QTY);
                    }
                }
                cartRef.current = merged;
                setCartItems(merged);
                if (mergeGuestCart && Object.keys(cartRef.current).length > 0) syncCart(merged, true);
            }
        } catch {
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    }, [syncCart]);

    const logout = async () => {
        try {
            await axios.post("/api/user/logout");
        } catch {
            // even if the request fails we still clear the local session below
        }
        clearTimeout(syncTimer.current);
        userRef.current = null;
        setUser(null);
        cartRef.current = {};
        setCartItems({});
        toast.success("Logged out");
        navigate("/");
    };

    // ---------- Cart ----------
    const addToCart = (itemId) => {
        const next = { ...cartRef.current };
        next[itemId] = Math.min((next[itemId] || 0) + 1, MAX_QTY);
        commitCart(next);
        toast.success("Added to cart", { id: "cart-toast" });
    };

    const updateCartItem = (itemId, quantity) => {
        const next = { ...cartRef.current };
        if (quantity <= 0) delete next[itemId];
        else next[itemId] = Math.min(quantity, MAX_QTY);
        commitCart(next);
    };

    const removeFromCart = (itemId) => {
        const next = { ...cartRef.current };
        if (next[itemId]) {
            next[itemId] -= 1;
            if (next[itemId] <= 0) delete next[itemId];
        }
        commitCart(next);
        toast.success("Removed from cart", { id: "cart-toast" });
    };

    const clearCart = () => {
        cartRef.current = {};
        setCartItems({});
    };

    const getCartCount = () => Object.values(cartItems).reduce((total, qty) => total + qty, 0);

    // For DISPLAY only: the server recalculates the real total from the database when you place an order
    const getCartAmount = () => {
        let total = 0;
        for (const [id, qty] of Object.entries(cartItems)) {
            const product = products.find((item) => item._id === id);
            if (product) total += product.offerPrice * qty;
        }
        return Math.round(total * 100) / 100;
    };

    useEffect(() => {
        fetchProducts();
        fetchUser();
        fetchSeller();
    }, [fetchProducts, fetchUser, fetchSeller]);

    const value = {
        navigate,
        user, setUser,
        isSeller, setIsSeller,
        authChecked, sellerChecked,
        showUserLogin, setShowUserLogin,
        products, productsLoading, productsError, fetchProducts,
        currency,
        cartItems, addToCart, updateCartItem, removeFromCart, clearCart, getCartCount, getCartAmount,
        searchQuery, setSearchQuery,
        fetchUser, logout,
        axios,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
