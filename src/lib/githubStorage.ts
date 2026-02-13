import { Song, Playlist } from './types';

const API_BASE = 'https://api.github.com';

export interface VaultUser {
    username: string;
    token: string; // The PAT used for storage
    vaultPath: string; // Hashed path in repo
}

export interface ShareData {
    id: string;
    type: 'song' | 'playlist';
    content: any;
    expiresAt: string;
}

export class GitHubStorageService {
    private repo: string = 'Bees-D/Vlone-Storage';
    private pat: string;

    constructor(pat: string) {
        this.pat = pat;
    }

    private getHeaders() {
        return {
            'Authorization': `token ${this.pat}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        };
    }

    private async sha256(message: string): Promise<string> {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async getVaultPath(username: string, password: string): Promise<string> {
        const hash = await this.sha256(`${username}:${password}`);
        return `users/${hash}`;
    }

    async saveFile(path: string, content: any, message: string = 'Sync updates'): Promise<void> {
        const url = `${API_BASE}/repos/${this.repo}/contents/${path}`;

        // Try to get existing file SHA first
        let sha: string | undefined;
        try {
            const res = await fetch(url, { headers: this.getHeaders() });
            if (res.ok) {
                const data = await res.json();
                sha = data.sha;
            }
        } catch (e) { }

        const body = {
            message,
            content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
            sha
        };

        const res = await fetch(url, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error('Failed to save to cloud storage');
    }

    async readFile(path: string): Promise<any> {
        const url = `${API_BASE}/repos/${this.repo}/contents/${path}`;
        const res = await fetch(url, { headers: this.getHeaders() });
        if (!res.ok) return null;

        const data = await res.json();
        return JSON.parse(decodeURIComponent(escape(atob(data.content))));
    }

    // Sync Playlists
    async syncPlaylists(vaultPath: string, playlists: Playlist[]): Promise<void> {
        await this.saveFile(`${vaultPath}/playlists.json`, playlists, 'Sync Playlists');
    }

    async getCloudPlaylists(vaultPath: string): Promise<Playlist[] | null> {
        return await this.readFile(`${vaultPath}/playlists.json`);
    }

    // Temporary Share Links
    async createShareLink(data: Omit<ShareData, 'expiresAt'>): Promise<string> {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const share: ShareData = { ...data, expiresAt };
        await this.saveFile(`shares/${share.id}.json`, share, 'Create Share Link');
        return share.id;
    }

    async getShareData(id: string): Promise<ShareData | null> {
        const data = await this.readFile(`shares/${id}.json`);
        if (!data) return null;

        if (new Date(data.expiresAt) < new Date()) {
            return null; // Expired
        }
        return data;
    }
}
