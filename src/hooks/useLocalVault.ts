import { useState, useEffect, useCallback } from 'react';
import { Song } from '../lib/types';

const DB_NAME = '999_local_vault';
const STORE_NAME = 'tracks';

export interface LocalTrack extends Song {
    blob: Blob;
    addedAt: string;
    fileSize: number;
}

export function useLocalVault() {
    const [localTracks, setLocalTracks] = useState<LocalTrack[]>([]);
    const [loading, setLoading] = useState(true);

    const getDB = (): Promise<IDBDatabase> => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (e) => {
                const db = (e.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    };

    const loadTracks = useCallback(async () => {
        try {
            const db = await getDB();
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const tracks = request.result.map((t: LocalTrack) => ({
                    ...t,
                    // Create fresh object URLs for the session
                    audio_url: URL.createObjectURL(t.blob)
                }));
                setLocalTracks(tracks);
                setLoading(false);
            };
        } catch (err) {
            console.error('Failed to load local vault:', err);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTracks();
        // Cleanup object URLs on unmount
        return () => {
            localTracks.forEach(t => {
                if (t.audio_url?.startsWith('blob:')) {
                    URL.revokeObjectURL(t.audio_url);
                }
            });
        };
    }, []);

    const addLocalTrack = useCallback(async (file: File, metadata: Partial<Song>) => {
        const db = await getDB();
        const id = `local-${Date.now()}-${file.name}`;

        const track: LocalTrack = {
            id,
            title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
            artist: metadata.artist || 'Local Upload',
            duration: 0,
            audio_url: '', // Set in UI or reload
            file_path: file.name,
            blob: file,
            addedAt: new Date().toISOString(),
            fileSize: file.size,
            category: 'Local Vault'
        };

        return new Promise<LocalTrack>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(track);

            request.onsuccess = () => {
                const trackWithUrl = { ...track, audio_url: URL.createObjectURL(file) };
                setLocalTracks(prev => [...prev, trackWithUrl]);
                resolve(trackWithUrl);
            };
            request.onerror = () => reject(request.error);
        });
    }, []);

    const removeLocalTrack = useCallback(async (id: string) => {
        const db = await getDB();
        return new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                setLocalTracks(prev => prev.filter(t => t.id !== id));
                resolve();
            };
            request.onerror = () => reject(request.error);
        });
    }, []);

    return { localTracks, addLocalTrack, removeLocalTrack, loading };
}
