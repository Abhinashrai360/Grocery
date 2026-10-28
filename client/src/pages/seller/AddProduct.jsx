import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets, categories } from "../../assets/assets";
import { getErrorMessage, useAppContext } from "../../context/AppContext";

const MAX_IMAGES = 4;
const MAX_SIZE = 5 * 1024 * 1024;

const AddProduct = () => {
    const { axios, fetchProducts } = useAppContext();
    const [files, setFiles] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [saving, setSaving] = useState(false);

    // small previews for the chosen images (revoked to avoid memory leaks)
    const [previews, setPreviews] = useState([]);
    useEffect(() => {
        const urls = files.map((file) => URL.createObjectURL(file));
        setPreviews(urls);
        return () => urls.forEach((url) => URL.revokeObjectURL(url));
    }, [files]);

    const onPickImage = (index, file) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) return toast.error("Please choose an image file");
        if (file.size > MAX_SIZE) return toast.error("Each image must be smaller than 5 MB");
        setFiles((prev) => {
            const next = [...prev];
            next[index] = file;
            return next.filter(Boolean);
        });
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (saving) return;

        if (files.length === 0) return toast.error("Please upload at least one image");
        if (!category) return toast.error("Please select a category");
        if (Number(offerPrice) > Number(price)) return toast.error("Offer price cannot be higher than the price");

        setSaving(true);
        try {
            const productData = {
                name: name.trim(),
                description: description.split("\n").map((line) => line.trim()).filter(Boolean),
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
            };
            const formData = new FormData();
            formData.append("productData", JSON.stringify(productData));
            files.forEach((file) => formData.append("images", file));

            const { data } = await axios.post("/api/product/add", formData);
            if (data.success) {
                toast.success(data.message);
                setName(""); setDescription(""); setCategory(""); setPrice(""); setOfferPrice(""); setFiles([]);
                fetchProducts();
            } else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-8 flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <h1 className="text-2xl font-medium">Add Product</h1>

                <div>
                    <p className="text-base font-medium">Product Images <span className="text-gray-400 text-sm font-normal">(up to {MAX_IMAGES}, max 5 MB each)</span></p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array.from({ length: Math.min(files.length + 1, MAX_IMAGES) }).map((_, index) => (
                            <label key={index} htmlFor={`image${index}`} className="cursor-pointer">
                                <input accept="image/png,image/jpeg,image/webp,image/gif" type="file" id={`image${index}`} hidden onChange={(e) => { onPickImage(index, e.target.files[0]); e.target.value = ""; }} />
                                <img className="w-24 h-24 object-cover border border-gray-300 rounded bg-white hover:border-primary transition" src={previews[index] || assets.upload_area} alt={previews[index] ? `Selected image ${index + 1}` : "Upload an image"} />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-name">Product Name</label>
                    <input id="product-name" onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="e.g. Tomato 1 kg" className="field" minLength={2} maxLength={120} required />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="product-description">Product Description <span className="text-gray-400 text-sm font-normal">(one point per line)</span></label>
                    <textarea id="product-description" onChange={(e) => setDescription(e.target.value)} value={description} rows={4} className="field resize-none" placeholder={"Fresh and organic\nRich in Vitamin C"} required />
                </div>

                <div className="w-full flex flex-col gap-1">
                    <label className="text-base font-medium" htmlFor="category">Category</label>
                    <select id="category" onChange={(e) => setCategory(e.target.value)} value={category} className="field" required>
                        <option value="">Select Category</option>
                        {categories.map((item) => (
                            <option key={item.path} value={item.path}>{item.path}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-5 flex-wrap">
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="product-price">Product Price</label>
                        <input id="product-price" onChange={(e) => setPrice(e.target.value)} value={price} type="number" min="0.01" step="0.01" placeholder="0" className="field" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1 w-32">
                        <label className="text-base font-medium" htmlFor="offer-price">Offer Price</label>
                        <input id="offer-price" onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} type="number" min="0.01" step="0.01" placeholder="0" className="field" required />
                    </div>
                </div>

                <button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary hover:bg-primary-dull disabled:opacity-60 transition text-white font-medium rounded cursor-pointer">
                    {saving ? "Uploading..." : "ADD"}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
