import EmptyState from "../components/EmptyState";

const NotFound = () => (
    <EmptyState icon="🧭" title="Page not found" message="The page you are looking for does not exist." actionLabel="Go home" actionTo="/" />
);

export default NotFound;
