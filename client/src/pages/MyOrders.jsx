import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getErrorMessage, useAppContext } from "../context/AppContext";
import EmptyState from "../components/EmptyState";
import { handleImageError } from "../utils/placeholder";
import { resolveImage } from "../utils/productImage";

export const statusStyles = {
    "Order Placed": "bg-blue-50 text-blue-600 border-blue-200",
    "Packed": "bg-amber-50 text-amber-600 border-amber-200",
    "Out for Delivery": "bg-purple-50 text-purple-600 border-purple-200",
    "Delivered": "bg-green-50 text-green-600 border-green-200",
    "Cancelled": "bg-red-50 text-red-600 border-red-200",
};

const MyOrders = () => {
    const { axios, user, authChecked, currency, setShowUserLogin } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        setFailed(false);
        try {
            const { data } = await axios.get("/api/order/user");
            if (data.success) setOrders(data.orders);
            else { setFailed(true); toast.error(data.message); }
        } catch (error) {
            setFailed(true);
            toast.error(getErrorMessage(error, "Could not load your orders"), { id: "orders-error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authChecked) return;
        if (user) fetchOrders();
        else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authChecked, user]);

    if (!authChecked || loading) {
        return (
            <div className="mt-16 space-y-4 max-w-4xl" aria-busy="true">
                {[0, 1].map((i) => <div key={i} className="skeleton h-40 w-full" />)}
            </div>
        );
    }

    if (!user) {
        return <EmptyState icon="🔐" title="Please log in" message="Log in to see your orders." actionLabel="Login" onAction={() => setShowUserLogin(true)} />;
    }

    if (failed) {
        return <EmptyState icon="⚠️" title="Could not load orders" message="Please check your connection and try again." actionLabel="Retry" onAction={fetchOrders} />;
    }

    if (orders.length === 0) {
        return <EmptyState icon="📦" title="No orders yet" message="When you place an order it will show up here." actionLabel="Start shopping" actionTo="/products" />;
    }

    return (
        <div className="mt-16 pb-16">
            <div className="flex flex-col items-start mb-8">
                <h1 className="text-2xl font-medium uppercase">My Orders</h1>
                <div className="w-16 h-0.5 bg-primary rounded-full mt-2" />
            </div>

            {orders.map((order) => (
                <article key={order._id} className="border border-gray-300 rounded-lg mb-8 p-4 py-5 max-w-4xl bg-white animate-fade-up">
                    <div className="flex flex-wrap justify-between gap-2 text-gray-500 md:font-medium max-md:flex-col text-sm md:text-base">
                        <span>Order ID: <span className="break-all">{order._id}</span></span>
                        <span>Payment: {order.paymentMethod === "COD" ? "Cash On Delivery" : "Online"}{order.paymentMethod === "Online" && order.isPaid ? " (Paid)" : ""}</span>
                        <span>Total: {currency}{order.amount}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className={`text-xs md:text-sm border px-3 py-1 rounded-full font-medium ${statusStyles[order.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>{order.status}</span>
                        <span className="text-sm text-gray-500">
                            Ordered on {new Date(order.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                    </div>

                    {order.items.map((item, index) => {
                        const category = item.product?.category;
                        return (
                            <div key={index} className={`relative bg-white text-gray-500/70 ${order.items.length !== index + 1 ? "border-b" : ""} border-gray-300 flex flex-col md:flex-row md:items-center justify-between py-5 gap-4 w-full`}>
                                <div className="flex items-center">
                                    <div className="bg-primary/10 p-3 rounded-lg shrink-0">
                                        <img src={resolveImage(item.image)} alt={item.name} onError={handleImageError} className="w-16 h-16 object-contain" />
                                    </div>
                                    <div className="ml-4">
                                        {category ? (
                                            <Link to={`/products/${category.toLowerCase()}/${item.product._id}`} className="text-lg md:text-xl font-medium text-gray-800 hover:text-primary-dull">{item.name}</Link>
                                        ) : (
                                            <h2 className="text-lg md:text-xl font-medium text-gray-800">{item.name}</h2>
                                        )}
                                        <p className="text-sm">{category || ""}</p>
                                    </div>
                                </div>

                                <div className="text-primary-dull text-sm md:text-base font-medium">
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Item total: {currency}{Math.round(item.price * item.quantity * 100) / 100}</p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="text-sm text-gray-500 border-t border-gray-200 pt-3 flex flex-col md:flex-row md:justify-between gap-2">
                        {order.address && <p>Deliver to: {order.address.firstName} {order.address.lastName}, {order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}</p>}
                        <p>Subtotal {currency}{order.subtotal} + Tax {currency}{order.tax}</p>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default MyOrders;
