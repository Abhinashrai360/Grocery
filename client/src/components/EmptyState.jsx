import { Link } from "react-router-dom";

// Friendly message + optional call to action for empty lists and errors
const EmptyState = ({ icon = "🛒", title, message, actionLabel, actionTo, onAction }) => (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4 animate-fade-up" role="status">
        <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center text-4xl" aria-hidden="true">{icon}</div>
        <h2 className="text-xl md:text-2xl font-medium mt-5">{title}</h2>
        {message && <p className="text-gray-500 mt-2 max-w-md">{message}</p>}
        {actionLabel && actionTo && (
            <Link to={actionTo} className="mt-6 px-8 py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full">
                {actionLabel}
            </Link>
        )}
        {actionLabel && onAction && (
            <button onClick={onAction} className="mt-6 px-8 py-2.5 bg-primary hover:bg-primary-dull transition text-white rounded-full cursor-pointer">
                {actionLabel}
            </button>
        )}
    </div>
);

export default EmptyState;
