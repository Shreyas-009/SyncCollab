import React, { useEffect, useState } from 'react';

const PageTransition = ({ children, pageKey }) => {
    const [visible, setVisible] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        setVisible(false);
        setIsFinished(false);
        const t = requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });

        const timer = setTimeout(() => {
            setIsFinished(true);
        }, 300);

        return () => {
            cancelAnimationFrame(t);
            clearTimeout(timer);
        };
    }, [pageKey]);

    return (
        <div
            className="flex-1 flex flex-col overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transform: isFinished ? 'none' : (visible ? 'translateY(0)' : 'translateY(10px)'),
                transition: 'opacity 0.22s ease, transform 0.22s ease',
            }}
        >
            {children}
        </div>
    );
};

export default PageTransition;
