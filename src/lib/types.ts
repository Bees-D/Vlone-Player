export type MediaType = 'audio' | 'video' | 'unknown';

export type PlaybackMode = 'normal' | 'shuffle' | 'smart-shuffle' | 'radio';

export interface Song {
    id: string;
    title: string;
    artist: string;
    album?: string;
    duration: number;
    audio_url: string;
    video_url?: string;
    cover_url?: string;
    category?: string;
    era?: string;
    file_path: string;
    file_size?: number;
    lyrics?: string;
    producer?: string;
    engineer?: string;
    tags?: string[];
    created_at?: string;
    media_type?: MediaType;
}

export interface MediaFile {
    name: string;
    path: string;
    type: 'directory' | 'file';
    media_type?: MediaType;
    file_size?: number;
    extension?: string;
    children?: MediaFile[];
}

export interface Folder {
    name: string;
    path: string;
    type: 'directory' | 'file';
    children?: Folder[];
}

export interface Category {
    name: string;
    count: number;
    slug: string;
}

export interface Era {
    name: string;
    year?: string;
    description?: string;
    image?: string;
}

export interface Stats {
    total_songs: number;
    total_duration: number;
    categories_count: number;
    eras_count: number;
}

export interface Playlist {
    id: string;
    name: string;
    description?: string;
    songIds: string[];
}

export interface DownloadItem {
    id: string;
    name: string;
    path: string;
    url: string;
    progress: number;
    status: 'pending' | 'downloading' | 'completed' | 'error';
    size?: number;
}

export interface ShareablePlaylist {
    version: '1.0';
    type: 'playlist' | 'song';
    data: {
        name?: string;
        description?: string;
        songs: Array<{
            id?: string;
            title: string;
            artist: string;
            file_path?: string;
        }>;
    };
}

export interface ProducerFilter {
    producer: string;
    count: number;
}
