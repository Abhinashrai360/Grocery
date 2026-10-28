import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { getErrorMessage, useAppContext } from "../context/AppContext";
import EmptyState from "../components/EmptyState";
import { handleImageError } from "../utils/placeholder";
import { resolveImage } from "../utils/productImage";

// Razorpay Checkout.js is only loaded when the customer actually pays online
const loadRazorpayScript = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
});

const Cart = () => {
    const {
        products, productsLoading, currency, cartItems, updateCartItem, getCartCount, getCartAmount,
        navigate, user, setShowUserLogin, axios, clearCart,
    } = useAppContext();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddress, setShowAddress] = useState(false);
    const [paymentOption, setPaymentOption] = useState("COD");
    const [config, setConfig] = useState({ taxPercent: 2, onlinePayment: false });
    const [placing, setPlacing] = useState(false);

    // cart rows = cart quantities + the real product data (products that no longer exist are skipped)
    const cartArray = useMemo(() => (
        Object.entries(cartItems)
            .map(([id, quantity]) => {
                const product = products.find((item) => item._id === id);
                return product ? { ...product, quantity } : null;
            })
            .filter(Boolean)
    ), [cartItems, products]);

    const hasUnavailable = cartArray.some((item) => !item.inStock);
    const subtotal = getCartAmount();
    const tax = Math.round(subtotal * config.taxPercent) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    useEffect(() => {
        axios.get("/api/order/config").then(({ data }) => {
            if (data.success) setConfig({ taxPercent: data.taxPercent, onlinePayment: data.onlinePayment });
        }).catch(() => { });
    }, [axios]);

    useEffect(() => {
        if (!user) { setAddresses([]); setSelectedAddress(null); return; }
        axios.get("/api/address/get").then(({ data }) => {
            if (data.success) {
                setAddresses(data.addresses);
                setSelectedAddress((current) => current || data.addresses[0] || null);
            }
        }).catch((error) => toast.error(getErrorMessage(error, "Could not load your addresses")));
    }, [user, axios]);

    const placeOrder = async () => {
        if (placing) return;
        if (!user) { setShowUserLogin(true); return; }
        if (!selectedAddress) { toast.error("Please select a delivery address"); return; }
        if (hasUnavailable) { toast.error("Remove out-of-stock items to continue"); return; }

        setPlacing(true);
        let popupOpen = false; // while the Razorpay popup is open the button stays disabled
        try {
            // we only send WHICH products and HOW MANY: the server calculates prices and totals itself
            const payload = { items: cartArray.map((item) => ({ product: item._id, quantity: item.quantity })), address: selectedAddress._id };

            if (paymentOption === "COD") {
                const { data } = await axios.post("/api/order/cod", payload);
                if (data.success) {
                    toast.success(data.message);
                    clearCart();
                    navigate("/my-orders");
                } else toast.error(data.message);
            } else {
                const { data } = await axios.post("/api/order/razorpay", payload);
                if (!data.success) { toast.error(data.message); return; }
                if (!(await loadRazorpayScript())) { toast.error("Could not load the payment window. Check your connection."); return; }

                const rzp = new window.Razorpay({
                    key: data.keyId,
                    amount: data.amount,
                    currency: data.currency,
                    order_id: data.razorpayOrderId,
                    name: "GreenCart",
                    description: "Grocery order",
                    prefill: { name: user?.name || "", email: user?.email || "" },
                    theme: { color: "#4fbf8b" },
                    // payment finished in the popup: confirm it with our server (signature check)
                    handler: async (response) => {
                        try {
                            const { data: result } = await axios.post("/api/order/razorpay/verify", response);
                            if (result.success) {
                                toast.success(result.message);
                                clearCart();
                                navigate("/my-orders");
                            } else toast.error(result.message);
                        } catch (error) {
                            toast.error(getErrorMessage(error, "Payment received but could not be confirmed. Check My Orders."));
                        } finally {
                            setPlacing(false);
                        }
                    },
                    modal: { ondismiss: () => setPlacing(false) },
                });
                rzp.on("payment.failed", (response) => toast.error(response?.error?.description || "Payment failed. Please try again."));
                popupOpen = true;
                rzp.open();
            }
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            if (!popupOpen) setPlacing(false);
        }
    };

    if (productsLoading) {
        return <div className="mt-16 space-y-4" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-20 w-full" />)}</div>;
    }

    if (cartArray.length === 0) {
        return <EmptyState icon="🛒" title="Your cart is empty" message="Add some fresh groceries to get started." actionLabel="Start shopping" actionTo="/products" />;
    }

    return (
        <div className="flex flex-col md:flex-row mt-16 gap-10">
            <div className="flex-1 max-w-4xl">
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary-dull">{getCartCount()} Items</span>
                </h1>

                <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3 border-b border-gray-200">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((item) => (
                    <div key={item._id} className="grid grid-cols-[2fr_1fr_1fr] items-center text-sm md:text-base font-medium pt-4 pb-4 border-b border-gray-100 gap-2">
                        <div className="flex items-center md:gap-6 gap-3">
                            <Link to={`/products/${item.category.toLowerCase()}/${item._id}`} className="cursor-pointer w-20 h-20 md:w-24 md:h-24 flex items-center justify-center border border-gray-300 rounded bg-white shrink-0">
                                <img className="max-w-full h-full object-contain" src={resolveImage(item.image[0])} alt={item.name} onError={handleImageError} />
                            </Link>
                            <div>
                                <p className="hidden md:block font-semibold">{item.name}</p>
                                <p className="md:hidden font-semibold text-sm">{item.name}</p>
                                <p className="text-gray-500/70 text-xs md:text-sm">{currency}{item.offerPrice} each</p>
                                {!item.inStock ? (
                                    <p className="text-red-500 text-xs md:text-sm mt-1">Out of stock: please remove</p>
                                ) : (
                                    <div className="flex items-center gap-2 mt-1 text-gray-600 select-none">
                                        <button aria-label={`Decrease ${item.name}`} onClick={() => updateCartItem(item._id, item.quantity - 1)} className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer">-</button>
                                        <span className="w-6 text-center" aria-live="polite">{item.quantity}</span>
                                        <button aria-label={`Increase ${item.name}`} onClick={() => updateCartItem(item._id, item.quantity + 1)} className="w-7 h-7 border border-gray-300 rounded hover:bg-gray-100 cursor-pointer">+</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <p className="text-center">{currency}{Math.round(item.offerPrice * item.quantity * 100) / 100}</p>
                        <button onClick={() => updateCartItem(item._id, 0)} aria-label={`Remove ${item.name} from cart`} className="cursor-pointer mx-auto p-2 hover:bg-red-50 rounded-full">
                            <img src={assets.remove_icon} alt="" className="inline-block w-6 h-6" />
                        </button>
                    </div>
                ))}

                <Link to="/products" onClick={() => window.scrollTo(0, 0)} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary-dull font-medium w-fit">
                    <img className="group-hover:-translate-x-1 transition rotate-180 w-4" src={assets.arrow_right_icon_colored} alt="" />
                    Continue Shopping
                </Link>
            </div>

            <aside className="md:max-w-[360px] w-full bg-primary-soft/60 p-5 max-md:mt-4 border border-gray-300/70 rounded-lg self-start md:sticky md:top-24">
                <h2 className="text-xl md:text-2xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500 text-sm">
                            {selectedAddress
                                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                                : user ? "No address found" : "Login to select an address"}
                        </p>
                        <button onClick={() => (user ? setShowAddress(!showAddress) : setShowUserLogin(true))} aria-expanded={showAddress} className="text-primary-dull hover:underline cursor-pointer text-sm shrink-0 ml-3">
                            Change
                        </button>
                        {showAddress && user && (
                            <div className="absolute top-8 py-1 bg-white border border-gray-300 text-sm w-full z-10 rounded shadow-md">
                                {addresses.map((address) => (
                                    <button key={address._id} onClick={() => { setSelectedAddress(address); setShowAddress(false); }} className="block w-full text-left text-gray-600 p-2 hover:bg-gray-100 cursor-pointer">
                                        {address.street}, {address.city}, {address.state}, {address.country}
                                    </button>
                                ))}
                                <button onClick={() => navigate("/add-address")} className="block w-full text-center text-primary-dull p-2 hover:bg-primary/10 cursor-pointer">
                                    + Add address
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>
                    <select value={paymentOption} onChange={(e) => setPaymentOption(e.target.value)} aria-label="Payment method" className="field mt-2 text-gray-600">
                        <option value="COD">Cash On Delivery</option>
                        {config.onlinePayment && <option value="Online">Online Payment</option>}
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between"><span>Price</span><span>{currency}{subtotal}</span></p>
                    <p className="flex justify-between"><span>Shipping Fee</span><span className="text-primary-dull">Free</span></p>
                    <p className="flex justify-between"><span>Tax ({config.taxPercent}%)</span><span>{currency}{tax}</span></p>
                    <p className="flex justify-between text-lg font-medium mt-3 text-gray-800"><span>Total Amount:</span><span>{currency}{total}</span></p>
                </div>

                <button onClick={placeOrder} disabled={placing || hasUnavailable} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull disabled:opacity-60 disabled:cursor-not-allowed transition rounded">
                    {placing ? "Processing..." : paymentOption === "COD" ? "Place Order" : "Pay Online"}
                </button>
                <p className="text-xs text-gray-500 mt-3 text-center">Final prices are confirmed securely on our server.</p>
            </aside>
        </div>
    );
};

export default Cart;
