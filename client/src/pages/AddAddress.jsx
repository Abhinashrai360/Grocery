import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { getErrorMessage, useAppContext } from "../context/AppContext";

const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;
const ZIP_REGEX = /^[A-Za-z0-9\- ]{3,10}$/;

const FIELDS = [
    { name: "firstName", label: "First Name", type: "text", autoComplete: "given-name", half: true },
    { name: "lastName", label: "Last Name", type: "text", autoComplete: "family-name", half: true },
    { name: "street", label: "Street address", type: "text", autoComplete: "address-line1" },
    { name: "city", label: "City", type: "text", autoComplete: "address-level2", half: true },
    { name: "state", label: "State", type: "text", autoComplete: "address-level1", half: true },
    { name: "zipCode", label: "Zip / Pin code", type: "text", autoComplete: "postal-code", half: true },
    { name: "country", label: "Country", type: "text", autoComplete: "country-name", half: true },
    { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
];

const AddAddress = () => {
    const { axios, user, authChecked, navigate, setShowUserLogin } = useAppContext();
    const [address, setAddress] = useState({ firstName: "", lastName: "", street: "", city: "", state: "", zipCode: "", country: "India", phone: "" });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    // addresses belong to an account, so send visitors back to the cart and ask them to log in
    useEffect(() => {
        if (authChecked && !user) { navigate("/cart"); setShowUserLogin(true); }
    }, [authChecked, user, navigate, setShowUserLogin]);

    const onChange = (e) => setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));

    const validate = () => {
        const next = {};
        for (const { name, label } of FIELDS) {
            if (!address[name].trim()) next[name] = `${label} is required`;
        }
        if (!next.phone && !PHONE_REGEX.test(address.phone.trim())) next.phone = "Enter a valid phone number";
        if (!next.zipCode && !ZIP_REGEX.test(address.zipCode.trim())) next.zipCode = "Enter a valid zip / pin code";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (saving || !validate()) return;
        setSaving(true);
        try {
            const { data } = await axios.post("/api/address/add", { address });
            if (data.success) {
                toast.success(data.message);
                navigate("/cart");
            } else toast.error(data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-16 pb-16">
            <h1 className="text-2xl md:text-3xl text-gray-600">
                Add Shipping <span className="font-semibold text-primary-dull">Address</span>
            </h1>
            <div className="flex flex-col-reverse md:flex-row justify-between mt-10 gap-10">
                <form noValidate onSubmit={onSubmitHandler} className="space-y-3 max-w-md w-full text-sm">
                    <div className="grid grid-cols-2 gap-3">
                        {FIELDS.map(({ name, label, type, autoComplete, half }) => (
                            <div key={name} className={half ? "" : "col-span-2"}>
                                <label htmlFor={name} className="text-gray-500">{label}</label>
                                <input
                                    id={name} name={name} type={type} autoComplete={autoComplete}
                                    value={address[name]} onChange={onChange}
                                    aria-invalid={Boolean(errors[name])} aria-describedby={`${name}-error`}
                                    className="field mt-1 text-gray-600"
                                />
                                {errors[name] && <p id={`${name}-error`} role="alert" className="text-red-500 text-xs mt-1">{errors[name]}</p>}
                            </div>
                        ))}
                    </div>
                    <button type="submit" disabled={saving} className="w-full mt-6 bg-primary text-white py-3 hover:bg-primary-dull disabled:opacity-60 transition cursor-pointer uppercase rounded">
                        {saving ? "Saving..." : "Save address"}
                    </button>
                </form>
                <img className="md:mr-16 mb-8 md:mt-0 max-w-sm w-full self-center" src={assets.add_address_iamge} alt="" />
            </div>
        </div>
    );
};

export default AddAddress;
