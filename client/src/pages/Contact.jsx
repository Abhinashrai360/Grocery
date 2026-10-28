import SectionTitle from "../components/SectionTitle";

const FAQS = [
    { q: "How fast is delivery?", a: "Delivery time depends on your location and the items in your order. You can follow the status of every order on the My Orders page." },
    { q: "Which payment methods do you accept?", a: "Cash on Delivery is always available. Online card payment is available when it is enabled for the store." },
    { q: "Can I change my delivery address?", a: "Yes. Pick any saved address in the cart before you place the order, or add a new one." },
    { q: "What if a product is out of stock?", a: "Out-of-stock items are clearly marked and cannot be ordered until they are back." },
];

const Contact = () => {
    const email = import.meta.env.VITE_SUPPORT_EMAIL;

    return (
        <div className="mt-16 max-w-3xl">
            <SectionTitle as="h1">Contact & Help</SectionTitle>
            <p className="text-gray-500">Have a question about an order or a product? Check the answers below first.</p>

            {email && (
                <a href={`mailto:${email}`} className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full">
                    ✉️ Email {email}
                </a>
            )}

            <div className="mt-10 space-y-3">
                {FAQS.map(({ q, a }) => (
                    <details key={q} className="group border border-gray-300 rounded-lg px-4 py-3 open:bg-primary-soft/60">
                        <summary className="cursor-pointer font-medium list-none flex justify-between items-center">
                            {q}
                            <span className="text-primary-dull transition group-open:rotate-45 text-xl" aria-hidden="true">+</span>
                        </summary>
                        <p className="text-gray-500 mt-2">{a}</p>
                    </details>
                ))}
            </div>
        </div>
    );
};

export default Contact;
