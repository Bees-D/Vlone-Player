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
            // Primary check: Stats
            const data = await api.getStats();
            const end = performance.now();
            setLatency(Math.round(end - start));
            setIsOnline(true);
            setStats({
                ...data,
                // Simulate global site stats if not provided by API
                total_streamed: data.total_streamed || 1245892 + Math.floor(Math.random() * 100),
                active_users: data.active_users || 42 + Math.floor(Math.random() * 10),
                total_users: data.total_users || 12854
            });
        } catch (err) {
            console.warn('Stats endpoint failed, trying fallback...', err);
            try {
                // Fallback check: Songs
                const songsRes = await api.getSongs({ page: 1 });
                if (songsRes && songsRes.data) {
                    const end = performance.now();
                    setLatency(Math.round(end - start));
                    setIsOnline(true);
                    // We can't set full stats, but we're online
                    // Maybe mock basic stats from result?
                    setStats({
                        total_songs: songsRes.total || 0,
                        total_duration: 0,
                        categories_count: 0,
                        eras_count: 0
                    });
                } else {
                    throw new Error('Fallback failed');
                }
            } catch (fallbackErr) {
                console.error('API offline:', fallbackErr);
                setIsOnline(false);
                setLatency(0);
                setStats(null);
            }
        }
    };

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return { isOnline, latency, checkStatus, stats };
};
