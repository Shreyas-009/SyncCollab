import { useCallback, useRef, useState } from 'react';

export const useMutationLocks = () => {
    const locksRef = useRef(new Set());
    const [, forceRender] = useState(0);

    const isLocked = useCallback((key) => {
        if (!key) return false;
        return locksRef.current.has(key);
    }, []);

    const lock = useCallback((key) => {
        if (!key || locksRef.current.has(key)) {
            return false;
        }

        locksRef.current.add(key);
        forceRender((value) => value + 1);
        return true;
    }, []);

    const unlock = useCallback((key) => {
        if (!key || !locksRef.current.has(key)) {
            return;
        }

        locksRef.current.delete(key);
        forceRender((value) => value + 1);
    }, []);

    const runLocked = useCallback(async (key, fn) => {
        if (!lock(key)) {
            return { executed: false, value: undefined };
        }

        try {
            const value = await fn();
            return { executed: true, value };
        } finally {
            unlock(key);
        }
    }, [lock, unlock]);

    return {
        isLocked,
        lock,
        unlock,
        runLocked,
        hasLocks: locksRef.current.size > 0
    };
};

export default useMutationLocks;
