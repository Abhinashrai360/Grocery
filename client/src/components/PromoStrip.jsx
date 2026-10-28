// Scrolling highlight strip under the hero (pauses on hover)
const ITEMS = [
    '🚚 Free shipping on every order',
    '🌿 Fresh fruits & vegetables',
    '🥛 Daily dairy & bakery',
    '💳 Cash on delivery or secure online payment',
    '🔒 Prices confirmed securely at checkout',
];

const PromoStrip = () => {
    const loop = [...ITEMS, ...ITEMS]; // duplicated so the loop is seamless
    return (
        <div className="marquee mt-8 overflow-hidden rounded-full bg-primary-soft border border-primary/20 py-2.5" aria-label="Store highlights">
            <div className="marquee-track flex w-max animate-marquee gap-12 whitespace-nowrap text-sm md:text-base text-primary-dull font-medium">
                {loop.map((text, index) => (
                    <span key={index} aria-hidden={index >= ITEMS.length}>{text}</span>
                ))}
            </div>
        </div>
    );
};

export default PromoStrip;
