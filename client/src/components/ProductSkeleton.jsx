// Placeholder cards shown while products load
const ProductSkeleton = ({ count = 5 }) => (
    <>
        {Array.from({ length: count }).map((_, index) => (
            <div key={index} className="border border-gray-500/20 rounded-lg px-3 md:px-4 py-3 bg-white" aria-hidden="true">
                <div className="skeleton h-28 md:h-36 w-full" />
                <div className="skeleton h-3 w-1/3 mt-4" />
                <div className="skeleton h-5 w-3/4 mt-2" />
                <div className="flex items-center justify-between mt-5">
                    <div className="skeleton h-6 w-1/3" />
                    <div className="skeleton h-8 w-16" />
                </div>
            </div>
        ))}
    </>
);

export default ProductSkeleton;
