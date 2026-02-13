import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Stats } from '../lib/types';

export const useApiStatus = () => {
    const [isOnline, setIsOnline] = useState<boolean | null>(null);
    const [latency, setLatency] = useState<number>(0);
    const [stats, setStats] = useState<Stats | null>(null);

    const checkStatus = async () => {
        const start = performance.now();
        try {
            const data = await api.getStats();
            const end = performance.now();
            setLatency(Math.round(end - start));
            setIsOnline(true);
            setStats(data);
        } catch (err) {
            setIsOnline(false);
            setLatency(0);
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return { isOnline, latency, checkStatus, stats };
};
