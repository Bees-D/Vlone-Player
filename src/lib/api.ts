import { Song, Category, Era, Stats, Folder, ProducerFilter } from './types';

const BASE_URL = 'https://juicewrldapi.com';
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
    const audioUrl = path ? `${BASE_URL}/files/download/?path=${encodeURIComponent(path)}` : '';

    // Guess cover from path or default? No info provided, use placeholder or custom covers
    // We can try to guess video url if extension matches
    const isVideo = path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.mkv');

    return {
        id: item.id?.toString() || '',
        title: item.name || 'Unknown Title',
        artist: item.credited_artists || 'Juice WRLD', // Default if missing
        album: item.era || 'Unreleased', // Using era as album proxy if missing
        duration: parseDuration(item.length),
        audio_url: audioUrl,
        video_url: isVideo ? audioUrl : undefined,
        cover_url: undefined, // Will be handled by custom covers or placeholders
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
        // 'producer' not directly supported by search param according to docs (only searchall), but maybe 'searchall' covers it?
        // Let's use 'searchall' if producer is provided, or just filter client side?
        // Or assume 'search' works. Docs say 'searchall' searches producers too.
        if (params?.producer) query.append('searchall', params.producer);

        if (params?.page) query.append('page', params.page.toString());

        const res = await fetchWithTimeout(`${BASE_URL}/songs/?${query.toString()}`);
        const json = await res.json();

        return {
            data: Array.isArray(json.results) ? json.results.map(mapApiSong) : [],
            total: json.count || 0
        };
    },

    async getRadio(): Promise<Song> {
        // Updated endpoint
        const res = await fetchWithTimeout(`${BASE_URL}/radio/random/`);
        const json = await res.json();
        // Returns a single song object?
        return mapApiSong(json);
    },

    async getCategories(): Promise<Category[]> {
        // Endpoint exists on root
        const res = await fetchWithTimeout(`${BASE_URL}/categories`);
        return res.json();
    },

    async getEras(): Promise<Era[]> {
        // Endpoint exists on root
        const res = await fetchWithTimeout(`${BASE_URL}/eras`);
        return res.json();
    },

    async getStats(): Promise<Stats> {
        // Endpoint exists on root
        const res = await fetchWithTimeout(`${BASE_URL}/stats`);
        return res.json();
    },

    async browseFiles(path: string = '/'): Promise<Folder[]> {
        const res = await fetchWithTimeout(`${BASE_URL}/files/?path=${encodeURIComponent(path)}`);
        const json = await res.json();
        return Array.isArray(json) ? json : (json.results || []);
    },

    async getLyrics(songId: string): Promise<string> {
        const res = await fetchWithTimeout(`${BASE_URL}/songs/${songId}`);
        const data = await res.json();
        return data.lyrics || "Lyrics not available for this track.";
    },

    async getProducers(): Promise<ProducerFilter[]> {
        // This endpoint doesn't exist, we aggregate from songs if possible
        // Or maybe just fetch page 1 and aggregate?
        const { data } = await this.getSongs({ page: 1 });
        const producerMap = new Map<string, number>();

        data.forEach(song => {
            if (song.producer) {
                producerMap.set(song.producer, (producerMap.get(song.producer) || 0) + 1);
            }
        });

        return Array.from(producerMap.entries()).map(([producer, count]) => ({
            producer,
            count
        })).sort((a, b) => b.count - a.count);
    },

    async getSongById(id: string): Promise<Song> {
        const res = await fetchWithTimeout(`${BASE_URL}/songs/${id}`);
        const json = await res.json();
        return mapApiSong(json);
    }
};
