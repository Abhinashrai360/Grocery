import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";
import { getErrorMessage, useAppContext } from "../../context/AppContext";
import EmptyState from "../../components/EmptyState";
import { statusStyles } from "../MyOrders";

const Orders = () => {
    const { currency, axios } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        setFailed(false);
        try {
            const { data } = await axios.get("/api/order/seller");
            if (data.success) setOrders(data.orders);
            else { setFailed(true); toast.error(data.message); }
        } catch (error) {
            setFailed(true);
            toast.error(getErrorMessage(error, "Could not load orders"), { id: "seller-orders-error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="md:p-10 p-4 space-y-4">
            <h1 className="text-2xl font-medium">Orders List</h1>

            {loading ? (
                <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-32 w-full max-w-4xl" />)}</div>
            ) : failed ? (
                <EmptyState icon="⚠️" title="Could not load orders" actionLabel="Retry" onAction={fetchOrders} />
            ) : orders.length === 0 ? (
                <EmptyState icon="📭" title="No orders yet" message="New customer orders will appear here." />
            ) : orders.map((order) => (
                <article key={order._id} className="flex flex-col md:grid md:grid-cols-[2fr_2fr_1fr_1fr] gap-5 justify-between p-5 max-w-4xl rounded-md border border-gray-300 bg-white text-gray-800">
                    <div className="flex gap-4">
                        <img className="w-12 h-12 object-cover opacity-60 shrink-0" src={assets.box_icon} alt="" />
                        <div>
                            {order.items.map((item, index) => (
                                <p key={index} className="font-medium">
                                    {item.name} <span className="text-primary-dull">x {item.quantity}</span>
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="text-sm">
                        {order.address ? (
                            <>
                                <p className="font-medium mb-1">{order.address.firstName} {order.address.lastName}</p>
                                <p>{order.address.street}, {order.address.city}, {order.address.state} {order.address.zipCode}, {order.address.country}</p>
                                <p>{order.address.phone}</p>
                            </>
                        ) : <p>Address unavailable</p>}
                    </div>

                    <p className="font-medium text-lg my-auto">{currency}{order.amount}</p>

                    <div className="flex flex-col text-sm gap-1">
                        <p>Method: {order.paymentMethod}</p>
                        <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                        <p>Payment: {order.isPaid ? "Paid" : "Pending"}</p>
                        <span className={`w-fit text-xs border px-2 py-0.5 rounded-full font-medium ${statusStyles[order.status] || ""}`}>{order.status}</span>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default Orders;
