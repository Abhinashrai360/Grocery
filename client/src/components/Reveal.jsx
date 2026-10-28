import { useEffect, useRef, useState } from 'react';

// Fades + slides its children in the first time they scroll into view.
// Falls back to "always visible" where IntersectionObserver is unavailable.
const Reveal = ({ children, className = '', delay = 0, as: Tag = 'div' }) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined');

    useEffect(() => {
        if (visible || !ref.current) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setVisible(true);
                observer.disconnect();
            }
        }, { threshold: 0.12 });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
            {children}
        </Tag>
    );
};

export default Reveal;
