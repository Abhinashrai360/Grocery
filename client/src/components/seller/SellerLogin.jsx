import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getErrorMessage, useAppContext } from "../../context/AppContext";

const SellerLogin = () => {
    const { isSeller, setIsSeller, navigate, axios, sellerChecked } = useAppContext();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isSeller) navigate("/seller");
    }, [isSeller, navigate]);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const { data } = await axios.post("/api/seller/login", { email, password });
            if (data.success) {
                setIsSeller(true);
                navigate("/seller");
            } else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    // wait for the session check so a logged in seller never sees a flash of the login form
    if (!sellerChecked || isSeller) return null;

    return (
        <form onSubmit={onSubmitHandler} className="min-h-screen flex items-center text-sm text-gray-600 px-4">
            <div className="flex flex-col gap-5 m-auto items-start p-8 py-12 w-full max-w-[352px] rounded-xl shadow-xl border border-gray-200 bg-white animate-fade-up">
                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">Seller</span> Login
                </p>
                <div className="w-full">
                    <label htmlFor="seller-email">Email</label>
                    <input id="seller-email" onChange={(e) => setEmail(e.target.value)} value={email} type="email" autoComplete="username" placeholder="Seller email" className="field mt-1" required />
                </div>
                <div className="w-full">
                    <label htmlFor="seller-password">Password</label>
                    <input id="seller-password" onChange={(e) => setPassword(e.target.value)} value={password} type="password" autoComplete="current-password" placeholder="Password" className="field mt-1" required />
                </div>
                <button type="submit" disabled={loading} className="bg-primary text-white w-full py-2.5 rounded-md cursor-pointer hover:bg-primary-dull disabled:opacity-60 transition">
                    {loading ? "Please wait..." : "Login"}
                </button>
            </div>
        </form>
    );
};

export default SellerLogin;
