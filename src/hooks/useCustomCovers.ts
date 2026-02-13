import { useState, useEffect, useCallback } from 'react';

/**
 * Custom cover art system.
 * Stores user-uploaded cover art in localStorage, keyed by a match pattern
 * (e.g. artist name, album name, song title, etc.).
 * Supports animated images (gif, webp, apng).
 * 
 * Storage format in localStorage under '999_custom_covers':
 * {
 *   [matchKey]: {
 *     dataUrl: string,      // base64 data URL of the image
 *     matchType: 'artist' | 'album' | 'song',
 *     matchValue: string,   // the value to match (e.g. "Outsiders")
 *     animated: boolean,
 *     addedAt: string
 *   }
 * }
 */

export interface CustomCover {
    dataUrl: string;
    matchType: 'artist' | 'album' | 'song' | 'producer';
    matchValue: string;
    animated: boolean;
    addedAt: string;
}

type CoverMap = Record<string, CustomCover>;

const STORAGE_KEY = '999_custom_covers';

const loadCovers = (): CoverMap => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveCovers = (covers: CoverMap) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(covers));
    } catch (err) {
        console.error('Failed to save custom covers (storage may be full):', err);
    }
};

export function useCustomCovers() {
    const [covers, setCovers] = useState<CoverMap>(loadCovers);

    // Persist on change
    useEffect(() => {
        saveCovers(covers);
    }, [covers]);

    /**
     * Upload a custom cover art image.
     * Reads the file, converts to data URL, and stores it.
     */
    const uploadCover = useCallback((
        file: File,
        matchType: CustomCover['matchType'],
        matchValue: string
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            // Max 5MB per image to keep localStorage manageable
            if (file.size > 5 * 1024 * 1024) {
                reject(new Error('Image must be under 5MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                const animated = file.type === 'image/gif' || file.type === 'image/webp' || file.type === 'image/apng';
                const key = `${matchType}:${matchValue.toLowerCase()}`;

                setCovers(prev => ({
                    ...prev,
                    [key]: {
                        dataUrl,
                        matchType,
                        matchValue,
                        animated,
                        addedAt: new Date().toISOString()
                    }
                }));
                resolve();
            };
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }, []);

    /**
     * Remove a custom cover art.
     */
    const removeCover = useCallback((matchType: CustomCover['matchType'], matchValue: string) => {
        const key = `${matchType}:${matchValue.toLowerCase()}`;
        setCovers(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    /**
     * Resolve the cover URL for a song.
     * Checks for custom covers matching the song's artist, album, title, or producer.
     * Returns the custom cover data URL if found, otherwise returns the original URL.
     */
    const resolveCoverUrl = useCallback((
        originalUrl: string | undefined,
        song: { title?: string; artist?: string; album?: string; producer?: string }
    ): string => {
        const fallback = originalUrl || '';

        // Check song-level override first (most specific)
        if (song.title) {
            const songKey = `song:${song.title.toLowerCase()}`;
            if (covers[songKey]) return covers[songKey].dataUrl;
        }

        // Check album-level override
        if (song.album) {
            const albumKey = `album:${song.album.toLowerCase()}`;
            if (covers[albumKey]) return covers[albumKey].dataUrl;
        }

        // Check artist-level override (e.g. "Outsiders" → custom art replaces all Outsiders songs)
        if (song.artist) {
            const artistKey = `artist:${song.artist.toLowerCase()}`;
            if (covers[artistKey]) return covers[artistKey].dataUrl;
        }

        // Check producer-level override
        if (song.producer) {
            const producerKey = `producer:${song.producer.toLowerCase()}`;
            if (covers[producerKey]) return covers[producerKey].dataUrl;
        }

        return fallback;
    }, [covers]);

    /**
     * Get all custom covers.
     */
    const getAllCovers = useCallback((): CustomCover[] => {
        return Object.values(covers);
    }, [covers]);

    /**
     * Check if a custom cover exists for a given match.
     */
    const hasCover = useCallback((matchType: CustomCover['matchType'], matchValue: string): boolean => {
        const key = `${matchType}:${matchValue.toLowerCase()}`;
        return key in covers;
    }, [covers]);

    return {
        uploadCover,
        removeCover,
        resolveCoverUrl,
        getAllCovers,
        hasCover,
        covers
    };
}
