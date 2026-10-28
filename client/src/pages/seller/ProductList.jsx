import toast from "react-hot-toast";
import { getErrorMessage, useAppContext } from "../../context/AppContext";
import EmptyState from "../../components/EmptyState";
import { handleImageError } from "../../utils/placeholder";
import { resolveImage } from "../../utils/productImage";

const ProductList = () => {
    const { products, productsLoading, currency, axios, fetchProducts } = useAppContext();

    const toggleStock = async (id, inStock) => {
        try {
            const { data } = await axios.post("/api/product/stock", { id, inStock });
            if (data.success) {
                await fetchProducts();
                toast.success(data.message);
            } else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="py-8 px-4 md:px-10">
            <h1 className="text-2xl font-medium">All Products</h1>

            {productsLoading ? (
                <div className="mt-6 space-y-3" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full max-w-4xl" />)}</div>
            ) : products.length === 0 ? (
                <EmptyState icon="📦" title="No products yet" message="Add your first product to start selling." actionLabel="Add product" actionTo="/seller" />
            ) : (
                <div className="flex flex-col items-center max-w-4xl w-full overflow-x-auto rounded-md bg-white border border-gray-500/20 mt-6">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold hidden md:block">Selling Price</th>
                                <th className="px-4 py-3 font-semibold">In Stock</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {products.map((product) => (
                                <tr key={product._id} className="border-t border-gray-500/20">
                                    <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                                        <div className="border border-gray-300 rounded p-1 shrink-0">
                                            <img src={resolveImage(product.image[0])} alt="" onError={handleImageError} className="w-16 h-12 object-contain" />
                                        </div>
                                        <span className="truncate max-sm:hidden w-full">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{product.category}</td>
                                    <td className="px-4 py-3 max-sm:hidden">{currency}{product.offerPrice}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                                            <input onChange={(e) => toggleStock(product._id, e.target.checked)} checked={product.inStock} type="checkbox" className="sr-only peer" aria-label={`${product.name} in stock`} />
                                            <div className="w-12 h-7 bg-slate-300 rounded-full peer peer-checked:bg-primary transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-primary" />
                                            <span className="dot absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;
