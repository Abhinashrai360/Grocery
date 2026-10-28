import { Link, NavLink, Outlet } from "react-router-dom";
import toast from "react-hot-toast";
import { assets } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";

const SellerLayout = () => {
    const { axios, setIsSeller, navigate } = useAppContext();

    const sidebarLinks = [
        { name: "Add Product", path: "/seller", icon: assets.add_icon },
        { name: "Product List", path: "/seller/product-list", icon: assets.product_list_icon },
        { name: "Orders", path: "/seller/orders", icon: assets.order_icon },
    ];

    const logout = async () => {
        try {
            await axios.get("/api/seller/logout");
        } catch {
            // the cookie is cleared on the server; if the request fails we still leave the panel
        }
        setIsSeller(false);
        toast.success("Logged out");
        navigate("/seller");
    };

    return (
        <>
            <header className="flex items-center justify-between px-4 md:px-8 border-b border-gray-300 py-3 bg-white">
                <Link to="/"><img src={assets.logo} alt="GreenCart" className="cursor-pointer w-34 md:w-38" /></Link>
                <div className="flex items-center gap-5 text-gray-500">
                    <p className="hidden sm:block">Hi! Admin</p>
                    <button onClick={logout} className="border rounded-full text-sm px-4 py-1 cursor-pointer hover:bg-gray-100">Logout</button>
                </div>
            </header>
            <div className="flex">
                <nav aria-label="Seller navigation" className="md:w-64 w-16 border-r h-[calc(100vh-61px)] text-base border-gray-300 pt-4 flex flex-col bg-white">
                    {sidebarLinks.map((item) => (
                        <NavLink
                            to={item.path} key={item.name} end={item.path === "/seller"}
                            aria-label={item.name}
                            className={({ isActive }) => `flex items-center py-3 px-4 gap-3 transition ${isActive
                                ? "border-r-4 md:border-r-[6px] bg-primary/10 border-primary text-primary-dull"
                                : "hover:bg-gray-100/90 border-white text-gray-700"}`}
                        >
                            <img src={item.icon} alt="" className="w-7 h-7" />
                            <p className="md:block hidden">{item.name}</p>
                        </NavLink>
                    ))}
                </nav>
                <main className="flex-1 min-w-0 h-[calc(100vh-61px)] overflow-y-auto bg-gray-50/50">
                    <Outlet />
                </main>
            </div>
        </>
    );
};

export default SellerLayout;
