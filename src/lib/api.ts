import { Song, Category, Era, Stats, Folder, ProducerFilter } from './types';

export const BASE_URL = 'https://juicewrldapi.com';
const TIMEOUT_MS = 10000; // 10s timeout to prevent hanging

const getHeaders = () => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    // PAT is reserved for GitHub Storage API only as requested
    return headers;
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
            },
            signal: controller.signal,
        });
        clearTimeout(id);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
        throw error;
    }
};

// Helper: Convert "m:ss" to seconds
const parseDuration = (lengthStr: string): number => {
    if (!lengthStr) return 0;
    const parts = lengthStr.split(':');
    if (parts.length === 2) {
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
};

// Helper: Map API song structure to our Song type
const mapApiSong = (item: any): Song => {
    const path = item.path || '';
    // Streaming URL: /files/download/?path={path}
    const audioUrl = path ? `${BASE_URL}/files/download/?path=${encodeURIComponent(path)}` : '';

    // Cover Art URL: /files/cover-art/?path={path} or item.image_url
    let coverUrl = item.image_url;
    if (!coverUrl && path) {
        coverUrl = `${BASE_URL}/files/cover-art/?path=${encodeURIComponent(path)}`;
    }

    // Video detection
    const isVideo = path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.mkv');

    return {
        id: item.id?.toString() || '',
        title: item.name || 'Unknown Title',
        artist: item.credited_artists || 'Juice WRLD', // Default if missing
        album: item.era || 'Unreleased', // Using era as album proxy if missing
        duration: parseDuration(item.length),
        audio_url: audioUrl,
        video_url: isVideo ? audioUrl : undefined,
        cover_url: coverUrl,
        category: item.category,
        era: item.era,
        file_path: path,
        lyrics: item.lyrics,
        producer: item.producers,
        tags: item.track_titles ? (Array.isArray(item.track_titles) ? item.track_titles : [item.track_titles]) : [],
        created_at: undefined, // Not provided
        media_type: isVideo ? 'video' : 'audio'
    };
};

export const api = {
    async getSongs(params?: { search?: string; category?: string; era?: string; producer?: string; page?: number }): Promise<{ data: Song[], total: number }> {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.category) query.append('category', params.category);
        if (params?.era) query.append('era', params.era);

        // Use 'searchall' for producer filtering as recommended
        if (params?.producer) query.append('searchall', params.producer);

        if (params?.page) query.append('page', params.page.toString());

        const res = await fetchWithTimeout(`${BASE_URL}/songs/?${query.toString()}`);
        const json = await res.json();

        // Handle pagination response (DRF standard: { results: [], count: ... })
        return {
            data: Array.isArray(json.results) ? json.results.map(mapApiSong) : [],
            total: json.count || 0
        };
    },

    async getRadio(): Promise<Song> {
        // Updated endpoint: /radio/random/ (as per docs)
        const res = await fetchWithTimeout(`${BASE_URL}/radio/random/`);
        const json = await res.json();
        return mapApiSong(json);
    },

    async getCategories(): Promise<Category[]> {
        const res = await fetchWithTimeout(`${BASE_URL}/categories`);
        return res.json();
    },

    async getEras(): Promise<Era[]> {
        const res = await fetchWithTimeout(`${BASE_URL}/eras`);
        return res.json();
    },

    async getStats(): Promise<Stats> {
        const res = await fetchWithTimeout(`${BASE_URL}/stats`);
        return res.json();
    },

    async browseFiles(path: string = '/'): Promise<Folder[]> {
        // Updated endpoint: /files/browse/?path={path}
        // Also removed force json.results check for Browse as it might list directly? 
        // Docs say "returns a list of items".
        // Use logic roughly similar to getSongs just in case
        const res = await fetchWithTimeout(`${BASE_URL}/files/browse/?path=${encodeURIComponent(path)}`);
        const json = await res.json();
        // Check if list or paginated. If simple list, json is array.
        return Array.isArray(json) ? json : (json.results || []);
    },

    async getLyrics(songId: string): Promise<string> {
        const res = await fetchWithTimeout(`${BASE_URL}/songs/${songId}`);
        const data = await res.json();
        return data.lyrics || "Lyrics not available for this track.";
    },

    async getProducers(): Promise<ProducerFilter[]> {
        // Fetch first 3 pages to get a better distribution of producers
        const pages = [1, 2, 3];
        const producerMap = new Map<string, number>();

        await Promise.all(pages.map(async (page) => {
            try {
                const { data } = await this.getSongs({ page });
                data.forEach(song => {
                    if (song.producer) {
                        // Split by common separators if multiple producers
                        const producers = song.producer.split(/[,&/]/).map(p => p.trim());
                        producers.forEach(p => {
                            if (p && p.length > 2) { // Filtering out tiny names like 'DP' or 'JE' if too short or noise
                                producerMap.set(p, (producerMap.get(p) || 0) + 1);
                            }
                        });
                    }
                });
            } catch (e) {
                console.warn(`Failed to fetch page ${page} for producers`);
            }
        }));

        return Array.from(producerMap.entries()).map(([producer, count]) => ({
            producer,
            count
        })).sort((a, b) => b.count - a.count);
    },
    BASE_URL, // Fixed: added comma

    async getSongById(id: string): Promise<Song> {
        const res = await fetchWithTimeout(`${BASE_URL}/songs/${id}`);
        const json = await res.json();
        return mapApiSong(json);
    }
};
