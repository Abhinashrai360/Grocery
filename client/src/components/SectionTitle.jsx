const SectionTitle = ({ children, as: Tag = "h2" }) => (
    <div className="flex flex-col items-start mb-6">
        <Tag className="text-2xl md:text-3xl font-medium">{children}</Tag>
        <div className="w-16 h-0.5 bg-primary rounded-full mt-2" />
    </div>
);

export default SectionTitle;
