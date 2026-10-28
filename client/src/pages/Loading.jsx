import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// Generic redirect/loader page (kept from the old hosted-payment flow), then redirects inside the app
const ALLOWED_NEXT = ["my-orders", "cart"];

const Loading = () => {
    const { navigate, fetchUser } = useAppContext();
    const { search } = useLocation();

    useEffect(() => {
        const next = new URLSearchParams(search).get("next");
        const target = ALLOWED_NEXT.includes(next) ? `/${next}` : "/";
        fetchUser(); // reload the saved cart from the server
        const timer = setTimeout(() => navigate(target), 4000);
        return () => clearTimeout(timer);
    }, [search, navigate, fetchUser]);

    return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4" role="status">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-primary" />
            <p className="text-gray-600">Confirming your payment, please wait...</p>
        </div>
    );
};

export default Loading;
