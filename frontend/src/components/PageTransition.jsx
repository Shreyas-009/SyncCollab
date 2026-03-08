import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, pageKey }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(false);
        const t = requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });
        return () => cancelAnimationFrame(t);
    }, [pageKey]);

    return (
        <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(10px)',
                transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
        >
            {children}
        </div>
    );
};

export default PageTransition;
