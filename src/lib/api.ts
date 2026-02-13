import { Song, Category, Era, Stats, Folder, ProducerFilter } from './types';

const BASE_URL = 'https://juicewrldapi.com/juicewrld';

export const api = {
    async getSongs(params?: { search?: string; category?: string; era?: string; producer?: string; page?: number }): Promise<{ data: Song[], total: number }> {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.category) query.append('category', params.category);
        if (params?.era) query.append('era', params.era);
        if (params?.producer) query.append('producer', params.producer);
        if (params?.page) query.append('page', params.page.toString());

        const res = await fetch(`${BASE_URL}/songs?${query.toString()}`);
        return res.json();
    },

    async getRadio(): Promise<Song> {
        const res = await fetch(`${BASE_URL}/radio`);
        return res.json();
    },

    async getCategories(): Promise<Category[]> {
        const res = await fetch(`${BASE_URL}/categories`);
        return res.json();
    },

    async getEras(): Promise<Era[]> {
        const res = await fetch(`${BASE_URL}/eras`);
        return res.json();
    },

    async getStats(): Promise<Stats> {
        const res = await fetch(`${BASE_URL}/stats`);
        return res.json();
    },

    async browseFiles(path: string = '/'): Promise<Folder[]> {
        const res = await fetch(`${BASE_URL}/files?path=${encodeURIComponent(path)}`);
        return res.json();
    },

    async getLyrics(songId: string): Promise<string> {
        const res = await fetch(`${BASE_URL}/songs/${songId}/lyrics`);
        const data = await res.json();
        return data.lyrics || "Lyrics not available for this track.";
    },

    async getProducers(): Promise<ProducerFilter[]> {
        // This might need to be implemented by aggregating from songs
        // For now, return empty array or implement client-side aggregation
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
        const res = await fetch(`${BASE_URL}/songs/${id}`);
        return res.json();
    }
};

