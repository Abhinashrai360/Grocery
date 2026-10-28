import { useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage, useAppContext } from "../context/AppContext";

const NewsLetter = () => {
    const { axios } = useAppContext();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await axios.post("/api/newsletter/subscribe", { email });
            if (data.success) {
                toast.success(data.message);
                setEmail("");
            } else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center space-y-2 mt-24">
            <h2 className="md:text-4xl text-2xl font-semibold">Never Miss a Deal!</h2>
            <p className="md:text-lg text-gray-500/70 pb-8">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>
            <form onSubmit={onSubmit} className="flex items-center justify-between max-w-2xl w-full md:h-13 h-12">
                <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                <input
                    id="newsletter-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field !rounded-r-none !border-r-0 h-full text-gray-500"
                    type="email"
                    placeholder="Enter your email id"
                    autoComplete="email"
                    required
                />
                <button type="submit" disabled={loading} className="md:px-12 px-8 h-full text-white bg-primary hover:bg-primary-dull disabled:opacity-60 transition-all cursor-pointer rounded-md rounded-l-none">
                    {loading ? "..." : "Subscribe"}
                </button>
            </form>
        </div>
    );
};
export default NewsLetter;
